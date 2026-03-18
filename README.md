# IFS - Insecure File Sharing

![License](https://img.shields.io/badge/license-BSD--3--Clause-blue)
![GitHub Actions](https://github.com/duckyfuz/insecure-file-sharing/actions/workflows/deploy.yaml/badge.svg)

A simple, ephemeral file-sharing service. Upload a file, get a 4-character code, share it. Files auto-delete after a day.

**Live at:** [ifs-app.kenf.dev](https://ifs-app.kenf.dev)

## Features

- 📤 Drag & drop file uploads (up to 500MB)
- 🔗 Short 4-character share codes
- ⏱️ 24-hour auto-expiration
- 🤖 Cloudflare Turnstile CAPTCHA protection
- 🌐 Global CDN via CloudFront

## Architecture

```
User → CloudFront → S3 (static site)
         ↓
      Lambda → S3 (presigned upload URL)
```

## Project Structure

```
├── apps/
│   ├── landing/      # Landing site
│   └── web/          # Main app (index.html)
├── functions/
│   └── upload.py     # Lambda: generates presigned URLs
├── infra/            # Terraform infrastructure
└── .github/workflows # CI/CD pipelines
```

## Setup

```bash
git clone https://github.com/duckyfuz/insecure-file-sharing.git
cd insecure-file-sharing
npm install  # Required for commit hooks
```

## Development

Commits use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add progress bar"
git commit -m "fix: resolve upload timeout"
```

## Deployment

Push to `main` triggers:

1. `terraform plan` → shown in PR comments
2. Manual approval via GitHub environment
3. `terraform apply`

## Tech Stack

| Component | Technology          |
| --------- | ------------------- |
| Frontend  | Vanilla HTML/CSS/JS |
| Backend   | AWS Lambda (Python) |
| Storage   | S3 + CloudFront     |
| DNS       | Cloudflare          |
| IaC       | Terraform           |
| CI/CD     | GitHub Actions      |

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up your development environment and submit pull requests.

## Supported By

<a href="https://1password.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/1password-logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/1password-logo.svg">
    <img alt="1Password" src="assets/1password-logo.svg" height="50">
  </picture>
</a>

[1Password](https://1password.com/) is the world's most-loved password manager.

<a href="https://termius.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/termius-logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/termius-logo.svg">
    <img alt="Termius" src="assets/termius-logo.svg" height="50">
  </picture>
</a>

[Termius](https://termius.com/) is the #1 SSH client for desktop and mobile.
