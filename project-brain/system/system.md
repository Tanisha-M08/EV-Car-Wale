# System Core Enforcer

Defines the global engineering workflow and execution constraints for the AI Runtime.

## Core Mandates
1. **Context Economy**: Never inject full codebase file contents into context unless explicitly requested by the user.
2. **Retrieve Target Context**: Use graph queries to list dependency components and read only what is needed.
3. **Strict Workflow Order**: Every prompt must resolve task classification, context loading, implementation planning, execution, validation checks, peer review, and memory synchronization in sequence.
4. **Separation of Concerns**: Do not store project implementations or database records inside this file.
5. **Architectural Permanence**: The system configurations remain stable and must not change.
