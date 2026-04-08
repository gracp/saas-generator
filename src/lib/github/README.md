# GitHub Integration Layer

This module handles all GitHub operations for generated SaaS projects.

## Features
- Create repos with proper setup (README, .gitignore, CI/CD)
- Create issues from MVP spec
- Create branches and PRs
- Monitor PR status and CI
- Connect to Vercel via GitHub integration
- Merge approved PRs and trigger deployment

## Architecture

The generator follows this flow:
1. User starts a new project via dashboard
2. Orchestrator creates a GitHub repo
3. Specialist agents work on feature branches
4. Each agent opens a PR when done
5. Code review agent reviews
6. Approved PRs merge → Vercel deploys

## Environment Variables
- GITHUB_TOKEN — Personal access token (or gh CLI auth)
- VERCEL_TOKEN — Vercel API token for deployment
- VERCEL_TEAM_ID — Vercel team/org ID
- OPENAI_API_KEY — For LLM-powered research and idea generation
