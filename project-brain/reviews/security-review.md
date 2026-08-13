# Security Review Checklist

Assesses cross-site script risks and variables hygiene.

## Checklist
1. Are user inputs escaped or sanitized before insertion into layouts?
2. Did we avoid adding API tokens or secret keys to client-side scripts?
3. Are calculation functions resilient against divisions by zero or negative number entries?
