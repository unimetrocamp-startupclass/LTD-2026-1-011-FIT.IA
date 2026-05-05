## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Always consult Graphify before answering any question about this project.
- Never make a commit without explicit permission from the user.
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- Graphify is integrated with Obsidian through graphify-out/obsidian/. Open graphify-out/obsidian as the Obsidian vault and use graph.canvas plus FILE_GROUPS.md for navigation.
- When the graph is rebuilt, refresh the Obsidian vault from graphify-out/graph.json so Obsidian stays aligned with Graphify.
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
