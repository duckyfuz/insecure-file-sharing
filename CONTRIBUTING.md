# Contributing to IFS

Thanks for your interest in contributing to Insecure File Sharing! We welcome contributions from everyone.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/insecure-file-sharing.git
   cd insecure-file-sharing
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```

## Development

### Project Structure

```
├── apps/
│   ├── web/          # Main app (index.html)
│   └── landing/      # Landing page (Next.js)
├── functions/
│   └── upload.py     # Lambda function
├── infra/            # Terraform infrastructure
└── .github/workflows # CI/CD pipelines
```

### Running Locally

**Landing page:**

```bash
cd apps/landing
npm install
npm run dev
```

**Infrastructure:**
See [infra/README.md](./infra/README.md) for deployment instructions.

## Commit Guidelines

We use [Conventional Commits](https://conventionalcommits.org). Your commits will be validated by commitlint.

| Type        | Description                                             |
| ----------- | ------------------------------------------------------- |
| `feat:`     | New feature                                             |
| `fix:`      | Bug fix                                                 |
| `docs:`     | Documentation only                                      |
| `style:`    | Formatting, no code change                              |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `test:`     | Adding or updating tests                                |
| `chore:`    | Maintenance tasks                                       |

**Examples:**

```bash
git commit -m "feat: add file size validation"
git commit -m "fix: resolve upload timeout issue"
git commit -m "docs: update README with new architecture diagram"
```

## Submitting a Pull Request

1. Create a new branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Commit using conventional commits
4. Push to your fork: `git push origin feat/my-feature`
5. Open a Pull Request against `main`

### PR Guidelines

- Keep PRs focused on a single change
- Include a clear description of what changed and why
- Ensure CI passes before requesting review
- Link any related issues

## Infrastructure Changes

If your PR includes Terraform changes:

- The CI will automatically run `terraform plan`
- The plan output will be posted as a PR comment
- An admin will review and approve before apply

## Questions?

Feel free to open an issue for discussion or reach out at **hello@kenf.dev**.
