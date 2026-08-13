# Security Guidelines

Coding rules to protect client-side environments from injection and data leaks.

## Rules
1. **XSS Mitigation**: Never assign unvalidated user inputs directly to `innerHTML`. Use `textContent` or run sanitization.
2. **Form Validation**: Validate data ranges on calculations (e.g. daily travel distance ranges must be positive).
3. **No Secret Exposure**: Do not store passwords or API keys inside source files.
