# Build a Landing Page with VS Code Agent Mode

A 30-minute hands-on workshop where you use GitHub Copilot's Agent Mode to scaffold and iterate on a static landing page — no frameworks, just HTML, CSS, and vanilla JavaScript.

## Prerequisites

- VS Code installed (latest stable release)
- GitHub Copilot subscription (Free, Pro, or Pro+)
- Basic familiarity with HTML, CSS, and JavaScript
- Comfort navigating files and folders in VS Code

## Setup

```bash
# 1. Clone or fork this repository
git clone <repo-url>
cd landing-page-workshop

# 2. Install dependencies (just a static file server)
npm install

# 3. Open the project in VS Code
code .
```

## Running the Project

```bash
# Serve the starter files (src/)
npm start
# → Open http://localhost:3000 in your browser

# Serve Exercise 1 solution for reference
npm run serve:solution1

# Serve Exercise 2 solution for reference
npm run serve:solution2
```

## Exercise Guide

| Exercise | Title | Starter Files | Solution Files |
|----------|-------|---------------|----------------|
| 1 | Prompt Agent Mode to Scaffold a Landing Page | `brief.md` + `src/index.html`, `src/styles.css`, `src/script.js` | `solutions/exercise-1/` |
| 2 | Ask the Agent to Add a Feature to Your Page | Continue from Exercise 1 output | `solutions/exercise-2/` |

### Exercise 1: Prompt Agent Mode to Scaffold a Landing Page

1. Open `brief.md` — this is the project brief that describes the landing page you'll build.
2. Open the Chat panel (**⌃⌘I** / **Ctrl+Alt+I**) and select **Agent** from the mode dropdown.
3. Type this prompt (customize the product name if you like):

   > Read @workspace/brief.md for the project brief. Create a single-page landing page with index.html, styles.css, and script.js in the src/ folder. Include a sticky nav bar, a dark hero section with a CTA button, a three-column features grid, two testimonial quotes, and a footer with social links. Use only plain HTML, CSS, and vanilla JS — no frameworks, no CDN links, no build tools. Make it mobile-responsive with a hamburger menu on small screens.

4. Review the diffs the agent proposes. Accept files that look correct; discard any that violate constraints.
5. Run `npm start` and open http://localhost:3000 to test.

### Exercise 2: Ask the Agent to Add a Feature

1. In the same Chat panel (Agent mode), send a follow-up prompt — pick one:
   - *"Add a dark/light theme toggle button in the navbar. Store the user's preference in localStorage so it persists on reload. Use only CSS custom properties and vanilla JS."*
   - *"Add a 'Back to Top' button that appears when the user scrolls past the hero section. Use vanilla JS and CSS only — no libraries."*
2. Review the diffs, accept changes, refresh your browser, and verify.
3. If something breaks, paste the browser console error as a follow-up prompt.

## Checking Solutions

Compare your agent-generated files against the reference solutions:

```bash
# Compare a specific file
diff src/index.html solutions/exercise-1/index.html

# Or open both side-by-side in VS Code
code --diff src/styles.css solutions/exercise-1/styles.css
```

The solutions are **reference implementations** — your agent-generated code will look different, and that's expected! Focus on whether it meets the requirements in `brief.md`.
