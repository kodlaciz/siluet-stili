# AGENTS.md

This repository is a skill for making 16:9 "What If" story films in the silhouette stickman style (three.js + Canvas 2D + puppeteer frame capture).

Before doing anything, read `SKILL.md` and follow it step by step. It holds the whole workflow, the rules and the known pitfalls.
Then read `STIL_KITABI.md` and the reports in `analiz/` (above all `analiz/gorsel.md` for the picture and `analiz/script.md` for the hook).

- The sample story is `stories/uykusuz/` (finished video: `ornek/uykusuz.mp4`). Copy it to start a new story.
- New stories go in `stories/<name>/`. The user gives the topic and, later, the voice lines.
- Setup: `cd engine && npm install`, `pip install -r requirements.txt`, ffmpeg and Google Chrome (or set `CHROME_PATH`).
- Reply to the user in their language (usually Turkish).
