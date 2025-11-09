const analyzeBtn = document.getElementById("analyzeBtn");
let chartInstance = null;

analyzeBtn.addEventListener("click", analyze);

async function analyze() {
    const username = document.getElementById("username").value.trim();
    if (!username) return alert("Enter username");
    const res = await fetch(`/analyze?username=${encodeURIComponent(username)}`);
    const data = await res.json();
    showProfile(data);
}

function showProfile(data) {
    document.getElementById("displayName").innerText = data.name || data.username;
    document.getElementById("totalRepos").innerText = data.total_repos;
    // ...other stats
    const ctx = document.getElementById("langChart").getContext("2d");
    if(chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, { type:"pie", data:{labels:Object.keys(data.languages), datasets:[{data:Object.values(data.languages)}]}});
    
    // NEW: top 3 repos
    let topDiv = document.getElementById("topRepos");
    if(!topDiv){
        topDiv = document.createElement("div");
        topDiv.id="topRepos";
        document.body.appendChild(topDiv);
    }
    topDiv.innerHTML = "<h3>Top 3 Repos:</h3>" + data.top_repos.map(r=>`<div>${r.name} ⭐ ${r.stars}</div>`).join("");
}
