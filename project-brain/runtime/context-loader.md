# Context Loader Module

Ensures minimum required project memory enters the conversation context window.

## Execution Directives
1. Look up affected nodes from the Graph Retriever.
2. Cross-reference file nodes with corresponding memory modules:
   - UI layout → `memory/frontend.md`
   - Data adjustments → `memory/database.md`
   - Navigation routes → `memory/routing.md`
3. Inject *only* selected markdown files into context. Do not load unreferenced modules.
