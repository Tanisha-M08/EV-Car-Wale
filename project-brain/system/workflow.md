# Runtime Execution Lifecycle

Defines the execution phases for prompt processing.

```mermaid
graph TD
    A[Receive Prompt] --> B[Task Classification]
    B --> C[Graph Retrieval]
    C --> D[Load Relevant Memory]
    D --> E[Implementation Planning]
    E --> F[Execution]
    F --> G[Static Validation]
    G --> H[AI Review]
    H --> I[Confidence Scoring]
    I --> J{Score >= 90?}
    J -- No --> K[Improve & Review Again]
    K --> G
    J -- Yes --> L[Incremental Memory Sync]
    L --> M[Incremental Graph Sync]
    M --> N[Append Task History]
    N --> O[Return Final Response]
```

## Lifecycle Execution Rules
1. **No Phase Skipping**: All stages must be executed in order.
2. **Deterministic Backoff**: If static validation fails, return directly to coding. Skip AI review.
3. **Synchronization**: Incremental memory updates must occur only after accepted tasks.
