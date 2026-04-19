# Security Policy

## Supported Versions

Currently, only the latest `main` branch is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of AuroraLens seriously. If you believe you have found a security vulnerability, please do **not** open a public issue. Instead, please report it privately.

Reports can be sent to: **mosiinmushtaq70@gmail.com**

Please include the following in your report:
- Type of issue (e.g., API key leakage, XSS, injection)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected code
- A proof-of-concept (PoC) or exploit code if possible

### Response Timeline
- **Acknowledgement**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Triage & Fix**: We strive to triage issues within 72 hours and provide a fix or mitigation as soon as possible (typically within 1-2 weeks depending on severity).
- **Disclosure**: We practice coordinated disclosure. We will coordinate with you to publish a fix before public disclosure.

## Scope

The following are **in scope**:
- Leakage of sensitive API keys or credentials in the frontend/backend codebase.
- Vulnerabilities that could compromise user location data.
- Injection flaws in the ML pipeline or API endpoints.

The following are **out of scope**:
- Volumetric/Denial of Service (DoS) attacks.
- Social engineering attacks.
- Issues related to third-party dependencies (unless a known patched version exists and we have failed to update).
