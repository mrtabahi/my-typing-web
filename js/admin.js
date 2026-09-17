document.addEventListener("DOMContentLoaded", async () => {
    // 1. Admin Verification Guard
    // अगर यूज़र एडमिन नहीं है, तो उसे तुरंत लॉगिन पेज पर भेज देगा और आगे का कोड रन नहीं होगा
    const profile = await AuthManager.getProfile();
    if (!profile || profile.role !== 'admin') {
        alert("केवल Admin ही इस पेज को एक्सेस कर सकते हैं!");
        window.location.href = "login.html";
        return; // सुरक्षा के लिए कोड यहीं रोक दें
    }

    // 2. Fetch Stats safely
    try {
        const { count: attemptCount } = await supabaseClient
            .from("attempts")
            .select("*", { count: 'exact', head: true });
            
        const { count: testCount } = await supabaseClient
            .from("tests")
            .select("*", { count: 'exact', head: true });

        const attemptsEl = document.getElementById("adm-total-attempts");
        const passagesEl = document.getElementById("adm-total-passages");

        if (attemptsEl) attemptsEl.textContent = attemptCount || 0;
        if (passagesEl) passagesEl.textContent = testCount || 0;
    } catch (err) {
        console.error("Stats लोड करने में एरर आया:", err);
    }

    // 3. Add Passage Form Handler
    const addPassageForm = document.getElementById("add-passage-form");
    if (addPassageForm) {
        addPassageForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const titleInput = document.getElementById("pass-title");
            const langInput = document.getElementById("pass-lang");
            const textInput = document.getElementById("pass-text");

            if (!titleInput  !langInput  !textInput) {
                alert("फॉर्म के इनपुट फ़ील्ड्स नहीं मिले!");
                return;
            }

            const title = titleInput.value.trim();
            const lang = langInput.value;
            const text = textInput.value.trim();

            if (!title || !text) {
                alert("कृपया Title और Passage पूरा भरें!");
                return;
            }

            // Submit Button को Disable करना ताकि बार-बार क्लिक न हो
            const submitBtn = addPassageForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            const { error } = await supabaseClient.from("tests").insert([{
                title: title,
                language: lang,
                passage: text,
                mode: 'screen',
                duration_minutes: 10,
                active: true
            }]);

            if (!error) {
                alert("Passage सफलतापूर्वक पब्लिश हो गया!");
                window.location.reload();
            } else {
                alert("Error publishing passage: " + error.message);
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
});
