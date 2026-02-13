# IFS - Insecure File Sharing

![License](https://img.shields.io/badge/license-Apache%202.0-blue)
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
│   ├── web/          # Main app (index.html)
│   └── landing/      # Landing site
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

## Sponsors

<a href="https://termius.com">
  <img src="assets/termius-logo.svg" alt="Termius" height="50">
</a>

Termius is the #1 SSH client for desktop and mobile.

## License

Apache
