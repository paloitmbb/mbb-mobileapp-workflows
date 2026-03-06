# Security — GitHub Actions Workflow Permissions

This document outlines the permissions configured across our CI/CD workflows and the security controls in place to protect the MBB Mobile App repository.

---

## Workflow Permissions (Principle of Least Privilege)

All workflows follow the **principle of least privilege** — only the minimum permissions required for each job are granted. The table below documents every permission used across our workflow files.

| Permission | Access Level | Purpose | Used By |
|---|---|---|---|
| `contents` | `read` | Clone the repository and read source code | All jobs |
| `security-events` | `write` | Upload CodeQL SARIF scan results to the **Security** tab | CodeQL Analysis |
| `pull-requests` | `write` | Post Dependency Review summary comments on PRs | Dependency Review |
| `actions` | `read` | Required by CodeQL on private/internal repositories | CodeQL Analysis |

> **Note:** No workflow requests `write` access to `contents`, meaning workflows **cannot** push commits, create tags, or modify repository code.

---

## How Permissions Are Applied

### Global Default (top-level)

```yaml
permissions:
  contents: read
```

A read-only default is set at the workflow level. Individual jobs then **escalate only what they need** using job-level `permissions` blocks.

### Job-Level Escalation

```yaml
jobs:
  analyze:
    permissions:
      contents: read
      security-events: write
      actions: read
```

This approach ensures that even if a job is compromised, its token cannot perform actions outside its declared scope.

---

## Security Controls

### 1. Fork PR Protection

All workflows block execution from forked pull requests to prevent untrusted code from accessing secrets or elevated permissions.

```yaml
if: >-
  github.event_name != 'pull_request' ||
  github.event.pull_request.head.repo.full_name == github.repository
```

### 2. Dependabot PR Restrictions

Security-sensitive jobs (Secret Scanning) are skipped for Dependabot PRs, which operate with a restricted token.

```yaml
if: github.actor != 'dependabot[bot]'
```

### 3. Concurrency Control

In-progress runs are automatically cancelled when a newer commit is pushed to the same branch, preventing resource waste and stale results.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

## Workflow Overview

| Workflow | File | Trigger | Jobs |
|---|---|---|---|
| **Android CI** | `android-ci.yml` | PR to `main`/`sit`, manual | Install → Scan → Test → Secret Scan → Build |
| **iOS CI** | `ios-ci.yml` | PR to `main`/`sit`, manual | Install → Scan → Test → Secret Scan → Build |
| **CodeQL Analysis** | `codeql.yml` | PR/push to `main`/`sit`, weekly schedule, manual | CodeQL SAST, Dependency Review, Secret Scan |

### Security Scanning Coverage

| Scan Type | Tool | What It Detects |
|---|---|---|
| **SAST** | [GitHub CodeQL](https://codeql.github.com/) | XSS, injection, prototype pollution, SSRF, path traversal, insecure randomness |
| **Dependency Review** | [dependency-review-action](https://github.com/actions/dependency-review-action) | Known CVEs (HIGH/CRITICAL) in new/updated dependencies |
| **Secret Scanning** | [TruffleHog](https://github.com/trufflesecurity/trufflehog) | Leaked API keys, tokens, passwords, and other credentials in git history |
| **npm Audit** | `npm audit` | Known vulnerabilities in npm dependencies |
| **OWASP Dependency Check** | Gradle plugin | Known CVEs in Android/Gradle dependencies |

---

## Official Documentation

### GitHub Actions Permissions

- [Permissions for the `GITHUB_TOKEN`](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [Setting permissions for a workflow](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/controlling-permissions-for-github_token)
- [Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)
- [Using `permissions` in workflow files](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#permissions)

### CodeQL & Code Scanning

- [About CodeQL code scanning](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql)
- [CodeQL query suites](https://docs.github.com/en/code-security/code-scanning/managing-your-code-scanning-configuration/codeql-query-suites)
- [Configuring CodeQL in a workflow](https://docs.github.com/en/code-security/code-scanning/creating-an-advanced-setup-for-code-scanning/customizing-your-advanced-setup-for-code-scanning)

### Dependency Review

- [About dependency review](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review)
- [dependency-review-action](https://github.com/actions/dependency-review-action)

### Secret Scanning

- [About secret scanning](https://docs.github.com/en/code-security/secret-scanning/introduction/about-secret-scanning)
- [TruffleHog GitHub Action](https://github.com/trufflesecurity/trufflehog)

### Fork & Dependabot Security

- [Security hardening — fork PRs](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions#potential-impact-of-a-compromised-runner)
- [Dependabot permissions and security](https://docs.github.com/en/code-security/dependabot/working-with-dependabot/automating-dependabot-with-github-actions#responding-to-events)

---

## Permission Matrix by Job

| Job | `contents` | `security-events` | `pull-requests` | `actions` |
|---|---|---|---|---|
| Install | read | — | — | — |
| Scan (Lint/Audit) | read | — | — | — |
| Test | read | — | — | — |
| Secret Scan | read | — | — | — |
| Build | read | — | — | — |
| CodeQL Analysis | read | **write** | — | read |
| Dependency Review | read | — | **write** | — |
