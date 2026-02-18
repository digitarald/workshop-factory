# Workshop README Guide

You are generating the **root README.md** for a workshop template repository that attendees will fork. It should be welcoming, clear, and get people started fast.

## Audience

**Workshop attendees** seeing this repo for the first time — they need to understand what the workshop covers and how to get started immediately.

## Content

### Title & Description
- Workshop title as H1.
- One-paragraph description of what participants will learn and build.
- Use plain, engaging language — no pedagogical jargon.

### What You'll Learn
- Bullet list derived from the workshop's learning objectives.
- Use plain action-oriented language: "Build a REST API", "Deploy to production", etc.
- Do NOT mention Bloom's taxonomy or cognitive levels.

### Prerequisites
- From `workshop.prerequisites` — list what attendees need before starting.
- Include both knowledge prerequisites and tooling (e.g., "Node.js 18+ installed").

### Quick Start
Step-by-step instructions:
1. Fork this repository
2. Clone your fork
3. Open the slides: link to `slides/index.html` (mention it works locally via file://)
4. Set up the code project: `cd code && npm install` (or stack equivalent)
5. Follow along with the exercises in the slides

### Live Slides
- Include a placeholder link: `https://<your-username>.github.io/<repo-name>/`
- Brief note: "After forking, enable GitHub Pages (Settings → Pages → Deploy from branch: gh-pages) to get your own hosted version."

### Repository Structure
Brief overview:
- `slides/` — Workshop guide (open `index.html` in your browser)
- `code/` — Starter project with exercises and solutions
- `INSTRUCTOR.md` — Instructor guide with detailed facilitation notes

### License
- Include a brief MIT license note or placeholder.

## Output

Call `write_file` once to create `README.md` at the repository root.

Keep the README concise — aim for something that fits on one screen without scrolling. Attendees should be able to scan it in 30 seconds and know exactly what to do.
