// पेज लोड होते ही तुरंत रन होगा
(async () => {
    // 1. Supabase Session Check
    const { data: { session } } = await supabaseClient.auth.getSession();

    // अगर यूजर लॉग-इन नहीं है, तो तुरंत Login Page पर भेजें
    if (!session) {
        window.location.replace("login.html");
        return;
    }

    // 2. Profile Role Check
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    // अगर यूजर Admin नहीं है, तो भी Login Page पर भेजें
    if (error  !profile  profile.role !== 'admin') {
        window.location.replace("login.html");
        return;
    }

    // 3. अगर Admin Verification 100% सही है, तभी एडमिन कंटेंट दिखाएं
    const adminContent = document.getElementById("admin-content");
    if (adminContent) {
        adminContent.style.display = "block";
    } else {
        document.body.style.display = "block";
    }

    // 4. Stats Load करें
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
        console.error("Stats error:", err);
    }

    // 5. Add Passage Form Handler
    const addPassageForm = document.getElementById("add-passage-form");
    if (addPassageForm) {
        addPassageForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const titleInput = document.getElementById("pass-title");
            const langInput = document.getElementById("pass-lang");
            const textInput = document.getElementById("pass-text");

            const title = titleInput.value.trim();
            const lang = langInput.value;
            const text = textInput.value.trim();

            if (!title || !text) {
                alert("कृपया Title और Passage पूरा भरें!");
                return;
            }

            const submitBtn = addPassageForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            const { error: insertError } = await supabaseClient.from("tests").insert([{
                title: title,
                language: lang,
                passage: text,
                mode: 'screen',
                duration_minutes: 10,
                active: true
            }]);

            if (!insertError) {
                alert("Passage सफलतापूर्वक पब्लिश हो गया!");
                window.location.reload();
            } else {
                alert("Error: " + insertError.message);
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    }
})();
