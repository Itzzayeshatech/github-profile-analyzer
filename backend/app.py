from flask import Flask, request, jsonify
import requests, os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__, static_folder="../frontend", static_url_path="/")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

def github_get(url, params=None):
    headers = {}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    return requests.get(url, headers=headers, params=params)

@app.route("/analyze")
def analyze():
    username = request.args.get("username", "").strip()
    if not username:
        return jsonify({"error": "username parameter is required"}), 400

    user_resp = github_get(f"https://api.github.com/users/{username}")
    if user_resp.status_code != 200:
        return jsonify({"error": "User not found or API error", "status": user_resp.status_code}), 404
    user_data = user_resp.json()

    repo_resp = github_get(f"https://api.github.com/users/{username}/repos", params={"per_page": 100})
    repo_data = repo_resp.json() if repo_resp.status_code == 200 else []

    languages = {}
    stars = forks = 0
    for r in repo_data:
        lang = r.get("language")
        if lang:
            languages[lang] = languages.get(lang, 0) + 1
        stars += r.get("stargazers_count", 0)
        forks += r.get("forks_count", 0)

    # --- Language percentages ---
    total_lang_count = sum(languages.values())
    languages_percent = {lang: round(count / total_lang_count * 100, 1) for lang, count in languages.items()} if total_lang_count else {}

    # --- Top 3 repos ---
    top_repos = sorted(repo_data, key=lambda r: r.get("stargazers_count",0), reverse=True)[:3]
    top_repos_summary = [{"name": r["name"], "stars": r["stargazers_count"]} for r in top_repos]

    return jsonify({
        "username": username,
        "name": user_data.get("name"),
        "avatar": user_data.get("avatar_url"),
        "bio": user_data.get("bio"),
        "total_repos": len(repo_data),
        "followers": user_data.get("followers", 0),
        "following": user_data.get("following", 0),
        "stars": stars,
        "forks": forks,
        "languages": languages_percent,
        "top_repos": top_repos_summary
    })

@app.route("/")
def index():
    return app.send_static_file("index.html")

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
