const analyzeBtn = document.getElementById("analyzeBtn");
const messageDiv = document.getElementById("message");
const spinner = document.createElement("div");
spinner.id = "spinner";
spinner.innerText = "Loading...";
spinner.style.display = "none";
document.querySelector(".container").insertBefore(spinner, document.getElementById("profile"));
let chartInstance = null;

analyzeBtn.addEventListener("click", analyze);

async function analyze() {
  const username = document.getElementById("username").value.trim();
  if (!username) { showMessage("Please enter a username"); return; }
  showMessage("");
  showLoading(true);
  try {
    const res = await fetch(`/analyze?username=${encodeURIComponent(username)}`);
    showLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(()=>({error: 'Error'}));
      showMessage(err.error || 'Error fetching data');
      return;
    }
    const data = await res.json();
    showProfile(data);
  } catch (e) {
    showLoading(false);
    showMessage("Network error. Make sure backend is running.");
    console.error(e);
  }
}

function showLoading(show) { spinner.style.display = show ? "block" : "none"; }
function showMessage(msg) { messageDiv.textContent = msg; }

function showProfile(data) {
  document.getElementById("avatar").src = data.avatar || "";
  document.getElementById("displayName").innerText = data.name || data.username;
  document.getElementById("bio").innerText = data.bio || "";
  document.getElementById("totalRepos").innerText = data.total_repos;
  document.getElementById("followers").innerText = data.followers;
  document.getElementById("following").innerText = data.following;
  document.getElementById("stars").innerText = data.stars;
  document.getElementById("forks").innerText = data.forks;
  document.getElementById("profile").classList.remove("hidden");

  const labels = Object.keys(data.languages);
  const values = Object.values(data.languages);
  const ctx = document.getElementById("langChart").getContext("2d");
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
  chartInstance = new Chart(ctx, { type: "pie", data: { labels, datasets: [{ data: values }] }, options: { responsive: true } });

  // Top 3 repos
  let topRepoDiv = document.getElementById("topRepos");
  topRepoDiv.innerHTML = "<h3>Top 3 Repos by Stars:</h3>" + 
    (data.top_repos.length ? data.top_repos.map(r => `<div>${r.name} - ⭐ ${r.stars}</div>`).join("") : "<div>None</div>");
}
