# Workshop Factory — Product Brief

## The Problem

Workshops take weeks to build and go stale in months. Every new audience — different skill level, different stack — means another rewrite. Product teams ship features faster than training content can keep up, and there's no way to push latest capabilities directly into workshops. No developer-native tool generates structured, validated workshop content from a topic and audience.

## Pain Points

- **Don't reflect latest features and best practices:** Technical skill half-lives have compressed to 2.5–5 years — shorter in AI, cloud, and frontend. Product teams ship new capabilities but have no direct channel to update the workshops that teach them. Trainers either spend hours manually updating exercises or knowingly deliver outdated content. ChatGPT/Claude can draft material but hallucinate code, lack version awareness, and require manual copy-paste — nothing stays in sync with the product.

- **Work best when adapted to the audience stack/experience:** Beginners need 60–70% hands-on time; advanced learners reject generic scenarios. Customizing exercises across stacks (Python vs. TypeScript, AWS vs. Azure) multiplies prep. No tool generates progressive-complexity paths or adapts structure to audience level.

- **Lack pedagogical structure that drives retention:** Most workshops allocate 80% to lecture and 20% to practice — the research says to reverse that. Lectures alone achieve ~5% retention; active practice with quizzes hits 75%. Formative assessments (knowledge checks, retrieval exercises) improve performance 10–15% over passive content, and the testing effect shows even incorrect guesses boost subsequent learning. Few workshop authors apply Bloom's taxonomy to objectives, scaffold exercises from worked examples to open problems, or space checkpoints for retrieval practice. The pedagogy is an afterthought.

- **Not self-contained to be run independently:** 1 in 5 practitioners get no follow-on support after training. Materials live in slide decks disconnected from runnable code. No single artifact bundles content, starter code, solutions, and checkpoints into a portable, version-controlled format for both facilitated and self-paced use.

## Scenarios

- **Product team driving feature adoption:** New Copilot agent mode just shipped. Generate a workshop grounded in the latest docs and release notes — feed in feature briefs as context so exercises reflect what actually shipped, not last quarter's beta. Export as Markdown alongside the demo repo. Regenerate affected sections when the next iteration lands.

- **Team lead upskilling session:** 2-hour "Intro to Docker" adapted to the team's Python/FastAPI stack. Walk the wizard, get a complete workshop with exercises targeting their actual stack. When Docker ships changes next quarter, regenerate specific sections instead of rewriting everything.

- **Educator multi-level training:** Generate beginner, intermediate, and advanced "Web Accessibility" tracks with shared structure but progressive complexity. Export all three to a dark-themed HTML site for self-paced follow-up.