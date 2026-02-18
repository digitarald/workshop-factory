# Build a Landing Page with VS Code Agent Mode
**Topic:** VS Code Agent
**Audience:** beginner (Static web)
**Duration:** 30 minutes

**Prerequisites:**
- VS Code installed (latest stable release)
- GitHub Copilot subscription (Free, Pro, or Pro+)
- Basic familiarity with HTML, CSS, and JavaScript
- Comfort navigating files and folders in VS Code

---

## Table of Contents
1. **Meet Agent Mode** (10 min)
   1.1. What Is Agent Mode and Why It Matters (3 min)
   1.2. Where Would You Use an AI Agent in Your Workflow? (3 min)
   1.3. Agent Mode Quick Check (4 min)
2. **Scaffold a Landing Page with Agent Mode** (15 min)
   2.1. Anatomy of a Good Prompt (2 min)
   2.2. Prompt Agent Mode to Scaffold a Landing Page (10 min)
   2.3. Compare Results — What Worked, What Surprised You? (3 min)
3. **Iterate and Wrap Up** (5 min)
   3.1. Ask the Agent to Add a Feature to Your Page (3 min)
   3.2. Key Takeaways Review (2 min)

---

## 1. Meet Agent Mode

**Learning Objectives:**
- Identify where to find Agent Mode in the VS Code Chat panel (remember)
- Distinguish Agent Mode from Chat and Inline Chat (understand)

**Duration:** 10 minutes

### 1.1. What Is Agent Mode and Why It Matters

**Duration:** 3 minutes

**Talking Points:**
- Agent Mode is a built-in feature of GitHub Copilot in VS Code — open the Chat panel (⌃⌘I / Ctrl+Alt+I) and select 'Agent' from the mode dropdown at the top.
- Unlike regular Chat (which answers questions) or Inline Chat (which edits a single selection), Agent Mode can autonomously create, edit, and delete multiple files to complete a task.
- Think of it as a pair programmer that can take action: it reads your project, proposes a plan, writes code, and even runs terminal commands — all from a single prompt.
- Agent Mode works iteratively: it makes changes, checks for errors (lint, compile), and self-corrects without you having to re-prompt.
- For static web projects (HTML, CSS, JS) this is especially powerful — the agent can scaffold an entire site structure in seconds.
- Every change the agent proposes shows up as a diff you can review before accepting. You stay in control at all times.
- Quick orientation: the mode picker (Agent / Chat / Edit) is at the top of the Chat panel. Make sure you see 'Agent' selected to follow along today.

### 1.2. Where Would You Use an AI Agent in Your Workflow?

**Duration:** 3 minutes

**Prompts:**
1. Think about a repetitive task you do when starting a new web project — creating boilerplate HTML, linking a CSS file, adding meta tags. Would you trust an AI agent to handle that? Why or why not?
2. What's the difference between asking a search engine for help vs. asking an agent that can directly edit your files? What risks or benefits come to mind?
3. Have you ever copied code from a tutorial or Stack Overflow and had to adapt it to your project? How might an agent that already sees your project files do this differently?
4. Where would you draw the line — what tasks would you want to keep doing manually even if an agent could do them?

### 1.3. Agent Mode Quick Check

**Duration:** 4 minutes

**Questions:**
1. How do you open Agent Mode in VS Code?
2. Name one key difference between Agent Mode and regular Copilot Chat.
3. True or false: Agent Mode applies all changes to your files automatically without showing you what changed.

#### Answers

<details>
<summary>Click to reveal answers</summary>

1. **Answer:** Open the Chat panel (⌃⌘I / Ctrl+Alt+I) and select 'Agent' from the mode dropdown at the top.
   **Explanation:** The Chat panel is your entry point for all Copilot interactions. The mode dropdown at the top lets you switch between Chat, Edit, and Agent modes. Knowing where this control lives is essential for the rest of the workshop.
2. **Answer:** Agent Mode can autonomously create, edit, and delete multiple files, while regular Chat only provides text responses and code suggestions you must manually apply.
   **Explanation:** This is the core distinction: Chat talks, Agent acts. Agent Mode has the ability to read your workspace, create and modify files, and run terminal commands — making it far more autonomous than a simple Q&A chat.
3. **Answer:** False. Agent Mode shows proposed changes as diffs that you review and accept or reject before they are applied.
   **Explanation:** Staying in control is a key design principle of Agent Mode. Every file creation, edit, or deletion appears as a diff you can inspect. You can accept individual changes, reject them, or undo everything. The agent proposes; you decide.

</details>

## 2. Scaffold a Landing Page with Agent Mode

**Learning Objectives:**
- Write an effective prompt that describes a static landing page (apply)
- Use @workspace references to give the agent context about existing files (apply)
- Review, accept, or reject file changes proposed by the agent (apply)

**Duration:** 15 minutes

### 2.1. Anatomy of a Good Prompt

**Duration:** 2 minutes

**Talking Points:**
- A good Agent Mode prompt has three parts: WHAT (the deliverable), HOW (constraints and style), and CONTEXT (what already exists).
- Be explicit about file structure: 'Create index.html, styles.css, and script.js in the project root' beats 'Make me a website.'
- State tech constraints up front: 'Use only plain HTML, CSS, and vanilla JavaScript — no frameworks, no CDN imports, no build tools.'
- Describe the visual outcome: 'A single-page landing page with a dark hero section, three-column features grid, testimonials, and a footer.'
- Use @workspace to reference existing files — e.g., 'Read @workspace/brief.md for the project requirements.' This grounds the agent in your actual project instead of generic assumptions.
- Longer, specific prompts produce better first results than short, vague ones. A detailed paragraph saves rounds of back-and-forth.
- You can always iterate — but a clear initial prompt means fewer follow-ups.

### 2.2. Prompt Agent Mode to Scaffold a Landing Page

**Duration:** 10 minutes

Use Agent Mode to generate a complete static landing page from a single prompt.

**Setup (1 min):**
1. Create a new empty folder called `landing-page` and open it in VS Code (File → Open Folder).
2. Create a file called `brief.md` and paste the starter code below into it. This gives the agent context about your project.

**Write your prompt (2 min):**
3. Open the Chat panel (⌃⌘I / Ctrl+Alt+I) and select **Agent** from the mode dropdown.
4. Type this prompt (feel free to customize the product name):

> Read @workspace/brief.md for the project brief. Create a single-page landing page with index.html, styles.css, and script.js. Include a sticky nav bar, a dark hero section with a CTA button, a three-column features grid, two testimonial quotes, and a footer with social links. Use only plain HTML, CSS, and vanilla JS — no frameworks, no CDN links, no build tools. Make it mobile-responsive with a hamburger menu on small screens.

5. Press Enter and watch the agent propose files.

**Review the diffs (4 min):**
6. For each file the agent creates, review the diff:
   - Does `index.html` use semantic HTML5 elements?
   - Does `styles.css` avoid any `@import` of external stylesheets?
   - Does `script.js` use only vanilla JS (no `require`, no `import` of packages)?
7. Click **Accept** on files that look correct. Click **Discard** on any file that violates your constraints.
8. If you discarded a file, send a follow-up prompt: 'Regenerate styles.css without any external imports.'

**Test in the browser (3 min):**
9. Open `index.html` in your browser (right-click → Open with Live Server, or double-click the file).
10. Check: Does the page render? Do nav links smooth-scroll? Does the hamburger menu work at narrow widths?
11. If something is broken, paste the browser console error into the Chat panel as a follow-up prompt.

#### Starter Code

```
# Project Brief: Awesome App Landing Page

## Product
Awesome App — a fictional productivity tool that helps you organize tasks.

## Sections needed
1. **Hero** — large headline, subtitle, and a "Get Started" call-to-action button
2. **Features** — three-column grid: "Fast", "Simple", "Secure" (use emoji for icons)
3. **Testimonials** — two short customer quotes with names
4. **Footer** — copyright line and placeholder social links

## Constraints
- Single page, no routing
- Plain HTML, CSS, vanilla JS only
- Mobile-responsive (hamburger nav on small screens)
- Dark hero section, light body
```

#### Solution

<details>
<summary>Click to reveal solution</summary>

```
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Awesome App</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <nav class="navbar">
    <div class="nav-brand">Awesome App</div>
    <button class="hamburger" aria-label="Toggle menu">&#9776;</button>
    <ul class="nav-links">
      <li><a href="#hero">Home</a></li>
      <li><a href="#features">Features</a></li>
      <li><a href="#testimonials">Testimonials</a></li>
      <li><a href="#footer">Contact</a></li>
    </ul>
  </nav>

  <section id="hero" class="hero">
    <h1>Get Things Done with Awesome App</h1>
    <p>The simplest way to organize your tasks and boost productivity.</p>
    <a href="#features" class="cta">Get Started</a>
  </section>

  <section id="features" class="features">
    <div class="feature">
      <span class="icon">⚡</span>
      <h3>Fast</h3>
      <p>Lightning-quick load times so you never wait.</p>
    </div>
    <div class="feature">
      <span class="icon">✨</span>
      <h3>Simple</h3>
      <p>A clean interface that stays out of your way.</p>
    </div>
    <div class="feature">
      <span class="icon">🔒</span>
      <h3>Secure</h3>
      <p>Your data is encrypted end-to-end.</p>
    </div>
  </section>

  <section id="testimonials" class="testimonials">
    <blockquote>
      <p>"Awesome App cut my planning time in half."</p>
      <cite>— Jamie R.</cite>
    </blockquote>
    <blockquote>
      <p>"Finally, a task tool that doesn't overwhelm me."</p>
      <cite>— Alex M.</cite>
    </blockquote>
  </section>

  <footer id="footer">
    <p>&copy; 2026 Awesome App</p>
    <div class="social">
      <a href="#">Twitter</a>
      <a href="#">GitHub</a>
      <a href="#">LinkedIn</a>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
```

</details>

#### Hints

<details>
<summary>Click to reveal hints</summary>

1. Make sure the mode dropdown at the top of the Chat panel says 'Agent' — not 'Chat' or 'Edit'.
2. Include @workspace/brief.md in your prompt so the agent reads your project brief for context.
3. If the agent outputs code with a CDN link or framework import, discard that file and re-prompt with: 'No external dependencies — vanilla only.'
4. You can accept or discard files individually — you don't have to accept everything as a batch.
5. If the page looks broken after accepting, open browser DevTools (F12), copy the console error, and paste it as a follow-up prompt to the agent.

</details>

### 2.3. Compare Results — What Worked, What Surprised You?

**Duration:** 3 minutes

**Prompts:**
1. Show your landing page to a neighbor (or share your screen). How close did the agent get to what you imagined? What's the biggest gap?
2. Did anyone's agent add something you didn't ask for — extra sections, animations, or library imports? How did you handle it?
3. Compare two participants' results: you likely gave slightly different prompts. What differences do you see, and what does that tell you about prompt specificity?
4. Did anyone use a follow-up prompt to fix or improve the output? What did you say, and did it work on the first try?

## 3. Iterate and Wrap Up

**Learning Objectives:**
- Refine an agent-generated page by giving follow-up prompts (apply)
- Recall best practices for reviewing AI-generated code (remember)

**Duration:** 5 minutes

### 3.1. Ask the Agent to Add a Feature to Your Page

**Duration:** 3 minutes

Practice the iterative workflow by asking Agent Mode to add a new feature to the landing page you built in Module 2.

1. Open the Chat panel (⌃⌘I / Ctrl+Alt+I) with **Agent** mode selected. Your previous conversation should still be visible — the agent remembers context from earlier turns.
2. Pick **one** of these follow-up prompts (or write your own):
   - "Add a dark/light theme toggle button in the navbar. Store the user's preference in localStorage so it persists on reload. Use only CSS custom properties and vanilla JS."
   - "Add a 'Back to Top' button that appears when the user scrolls past the hero section. Use vanilla JS and CSS only — no libraries."
3. Press Enter and let the agent propose changes.
4. Review the diffs:
   - Does the agent modify existing files or create new ones?
   - Are the changes scoped to the feature you asked for, or did the agent touch unrelated code?
5. Accept the changes, refresh your browser, and verify the feature works.
6. If it doesn't work, describe the bug as a follow-up prompt — e.g., "The toggle button doesn't switch colors. The CSS variables aren't being updated."

#### Starter Code

```
/* No new starter code needed — continue with the landing page from Module 2. */
/* If you don't have a working page, use this minimal index.html: */

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Awesome App</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <nav class="navbar">
    <div class="nav-brand">Awesome App</div>
    <ul class="nav-links">
      <li><a href="#hero">Home</a></li>
      <li><a href="#features">Features</a></li>
    </ul>
  </nav>
  <section id="hero" class="hero">
    <h1>Get Things Done</h1>
    <p>A simple productivity tool.</p>
  </section>
  <section id="features" class="features">
    <div class="feature"><h3>Fast</h3></div>
    <div class="feature"><h3>Simple</h3></div>
    <div class="feature"><h3>Secure</h3></div>
  </section>
  <footer>&copy; 2026 Awesome App</footer>
  <script src="script.js"></script>
</body>
</html>
```

#### Solution

<details>
<summary>Click to reveal solution</summary>

```
<!-- Added to navbar in index.html -->
<button class="theme-toggle" aria-label="Toggle theme">🌙</button>

/* Added to styles.css */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --nav-bg: #1a1a2e;
}
[data-theme="dark"] {
  --bg-color: #1a1a2e;
  --text-color: #e0e0e0;
  --nav-bg: #0f0f1a;
}
body {
  background: var(--bg-color);
  color: var(--text-color);
}
.theme-toggle {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}

// Added to script.js
const toggle = document.querySelector('.theme-toggle');
const saved = localStorage.getItem('theme');
if (saved) document.documentElement.setAttribute('data-theme', saved);

toggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  toggle.textContent = next === 'dark' ? '☀️' : '🌙';
});
```

</details>

#### Hints

<details>
<summary>Click to reveal hints</summary>

1. You don't need to start a new chat session — type your follow-up prompt in the same conversation so the agent has context from earlier.
2. Be specific about constraints in your follow-up too: remind the agent 'vanilla JS only, no libraries.'
3. If the agent modifies code you already accepted and breaks something, you can Undo (⌘Z / Ctrl+Z) to revert and re-prompt with more guidance.

</details>

### 3.2. Key Takeaways Review

**Duration:** 2 minutes

**Questions:**
1. Name two things you should include in an Agent Mode prompt to get better results.
2. After the agent proposes file changes, what should you do before accepting them?
3. How do you give the agent context about files that already exist in your project?

#### Answers

<details>
<summary>Click to reveal answers</summary>

1. **Answer:** Include specific constraints (e.g., 'vanilla JS only, no frameworks') and a clear description of the desired output (e.g., file names, visual layout, required sections).
   **Explanation:** Agent Mode performs best when you remove ambiguity. Explicit constraints prevent the agent from making assumptions (like importing a CSS framework), and a clear deliverable description gives it a concrete target. Think of it like giving instructions to a new teammate — the more context, the better the first draft.
2. **Answer:** Review each diff to verify correctness: check that the code matches your constraints, uses no unwanted dependencies, and follows the structure you asked for.
   **Explanation:** Agent Mode is a productivity tool, not an autopilot. Every proposed change is a diff you should inspect — just like reviewing a pull request. Check for unwanted dependencies, incorrect logic, and accessibility issues before clicking Accept. This habit protects your codebase and helps you learn what the agent does well vs. where it needs guidance.
3. **Answer:** Use @workspace references in your prompt — e.g., @workspace/brief.md or @workspace/styles.css — so the agent reads those files before generating code.
   **Explanation:** The @workspace reference is the key mechanism for grounding. Without it, the agent generates code based on generic patterns. With it, the agent reads your actual files and tailors its output — matching your existing variable names, style conventions, and project structure.

</details>

---

*Generated by Workshop Factory on 2026-02-18T23:40:48.257Z*
