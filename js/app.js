// MAIN CANDIDATE EXAM ROUTER AND CONTROLLER ENGINE
document.addEventListener("DOMContentLoaded", async () => {
    let currentPassage = null;
    let engine = null;

    const setupSec = document.getElementById("setup-section");
    const instSec = document.getElementById("instruction-section");
    const typingSec = document.getElementById("typing-section");
    const resultSec = document.getElementById("result-section");

    const passageSelect = document.getElementById("select-passage");
    const textarea = document.getElementById("typing-textarea");
    const passageDisplay = document.getElementById("passage-container");

    // Disable paste operations for anti-cheat
    textarea.addEventListener("paste", (e) => {
        e.preventDefault();
        alert("Pasting text is disabled during the official exam.");
    });

    // Fetch passages from Supabase
    async function loadPassages() {
        if (!supabaseClient) return;
        const { data: passages, error } = await supabaseClient.from("tests").select("*").eq("active", true);
        if (error || !passages) return;

        passageSelect.innerHTML = "";
        passages.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = `[${p.language}] ${p.title}`;
            passageSelect.appendChild(opt);
        });

        if (passages.length > 0) currentPassage = passages[0];
    }
    loadPassages();

    // Setup Form Handler
    document.getElementById("exam-config-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const testId = passageSelect.value;
        const { data: test } = await supabaseClient.from("tests").select("*").eq("id", testId).single();
        currentPassage = test;

        setupSec.style.display = "none";
        instSec.style.display = "block";
    });

    // Start Test Handler
    document.getElementById("btn-start-test").addEventListener("click", () => {
        instSec.style.display = "none";
        typingSec.style.display = "block";

        const candidateName = document.getElementById("candidate-name").value;
        const mode = document.getElementById("select-mode").value;
        const durationMin = parseInt(document.getElementById("select-duration").value);

        document.getElementById("disp-candidate-name").textContent = candidateName;
        document.getElementById("disp-test-title").textContent = currentPassage.title;

        if (mode === "page") {
            document.getElementById("offscreen-alert").style.display = "block";
            passageDisplay.style.display = "none";
        } else {
            passageDisplay.textContent = currentPassage.passage;
        }

        // Initialize Engine
        engine = new TypingEngine({
            passageText: currentPassage.passage,
            durationSeconds: durationMin * 60,
            mode: mode,
            onTick: (remSeconds) => {
                const m = Math.floor(remSeconds / 60).toString().padStart(2, '0');
                const s = (remSeconds % 60).toString().padStart(2, '0');
                document.getElementById("timer-display").textContent = `${m}:${s}`;
                
                // Real-Time Stats
                const stats = ScoringEngine.calculateScore(currentPassage.passage, textarea.value, (durationMin * 60) - remSeconds);
                document.getElementById("live-gross-wpm").textContent = stats.grossWpm;
                document.getElementById("live-net-wpm").textContent = stats.netWpm;
                document.getElementById("live-accuracy").textContent = `${stats.accuracy}%`;
                document.getElementById("live-errors").textContent = stats.totalErrors;
            },
            onComplete: async (result) => {
                typingSec.style.display = "none";
                resultSec.style.display = "block";
                displayResult(result.score);
                await submitAttemptToSupabase(result, candidateName, mode, durationMin * 60);
            }
        });

        textarea.addEventListener("input", () => engine.handleInput(textarea.value));
    });

    document.getElementById("btn-submit-early").addEventListener("click", () => {
        if (confirm("Are you sure you want to end your exam early?")) {
            engine.stop();
        }
    });

    function displayResult(score) {
        document.getElementById("res-net-wpm").textContent = score.netWpm;
        document.getElementById("res-gross-wpm").textContent = score.grossWpm;
        document.getElementById("res-accuracy").textContent = `${score.accuracy}%`;
        document.getElementById("res-total-errors").textContent = score.totalErrors;
        document.getElementById("res-penalty").textContent = score.penaltyWords;
        document.getElementById("res-typed-words").textContent = score.totalTypedWords;
        document.getElementById("res-free-errors").textContent = score.freeErrors;
        document.getElementById("res-excess-errors").textContent = score.excessErrors;
        document.getElementById("res-elapsed").textContent = score.elapsedMinutes.toFixed(2);
        
        const perf = ScoringEngine.getPerformanceLabel(score.netWpm);
        const b = document.getElementById("result-status-badge");
        b.textContent = perf.text;
        b.className = `score-status ${perf.class}`;
    }

    async function submitAttemptToSupabase(res, candidateName, mode, durationSeconds) {
        if (!supabaseClient) return;
        const candidateId = document.getElementById("candidate-id").value || 'GUEST';
        await supabaseClient.from("attempts").insert([{
            candidate_name: candidateName,
            candidate_id: candidateId,
            test_id: currentPassage.id,
            language: currentPassage.language,
            mode: mode,
            duration_seconds: durationSeconds,
            typed_words: res.score.totalTypedWords,
            typed_characters: res.score.totalTypedChars,
            correct_characters: res.score.correctChars,
            incorrect_characters: res.score.incorrectChars,
            total_errors: res.score.totalErrors,
            free_errors: res.score.freeErrors,
            excess_errors: res.score.excessErrors,
            penalty_words: res.score.penaltyWords,
            gross_wpm: res.score.grossWpm,
            net_wpm: res.score.netWpm,
            accuracy: res.score.accuracy,
            suspicious_events: res.suspiciousEvents
        }]);
    }
});
