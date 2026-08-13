# Graph Retriever

Resolves structural nodes affected by user modifications.

## Rules
1. Identify code keywords in the user request (e.g. "savings calculator").
2. Query `graph/graph-index.json` to extract connected source/target nodes (e.g. `app.js` and `index.html`).
3. Return the minimum list of dependent code paths.
