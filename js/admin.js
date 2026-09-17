document.addEventListener("DOMContentLoaded", async () => {
    await AuthManager.requireAdminGuard();

    // Fetch Stats
    const { count: attemptCount } = await supabaseClient.from("attempts").select("*", { count: 'exact', head: true });
    const { count: testCount } = await supabaseClient.from("tests").select("*", { count: 'exact', head: true });

    document.getElementById("adm-total-attempts").textContent = attemptCount || 0;
    document.getElementById("adm-total-passages").textContent = testCount || 0;

    // Add Passage Form
    document.getElementById("add-passage-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = document.getElementById("pass-title").value;
        const lang = document.getElementById("pass-lang").value;
        const text = document.getElementById("pass-text").value;

        const { error } = await supabaseClient.from("tests").insert([{
            title: title,
            language: lang,
            passage: text,
            mode: 'screen',
            duration_minutes: 10,
            active: true
        }]);

        if (!error) {
            alert("Passage Published Successfully!");
            window.location.reload();
        } else {
            alert("Error publishing passage: " + error.message);
        }
    });
});
