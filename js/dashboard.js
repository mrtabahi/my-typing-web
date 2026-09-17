document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.getElementById("history-table-body");
    if (!supabaseClient) return;

    const { data: attempts, error } = await supabaseClient
        .from("attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

    if (error || !attempts || attempts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7">No exam attempts recorded yet.</td></tr>`;
        return;
    }

    tableBody.innerHTML = attempts.map(a => `
        <tr>
            <td>${new Date(a.created_at).toLocaleDateString()}</td>
            <td>${a.language} Exam</td>
            <td><span class="badge badge-success">${a.mode}</span></td>
            <td>${a.gross_wpm}</td>
            <td><strong>${a.net_wpm}</strong></td>
            <td>${a.accuracy}%</td>
            <td>${a.total_errors}</td>
        </tr>
    `).join("");
});
