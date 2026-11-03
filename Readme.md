# Research Connect

Research Connect is a MERN application for finding researchers, sharing projects, and starting collaborations across departments.

## Project status

This repository is being developed against the Module 2 product requirements. Work is organized as one pull request per numbered requirement; the PRs are intended to be reviewed and merged in order because later work builds on earlier APIs and schemas.

| Requirement | Scope | Status |
| --- | --- | --- |
| 2.1 | Repository setup, README, issue tracking, and workflow | Repository/docs/templates and 21 PRs exist; requirement issue records still need to be created |
| 2.2 | React application initialization | Implemented |
| 2.3 | Reusable React components and interactions | Implemented |
| 2.4 | MongoDB schema design | Implemented |
| 2.5 | Database reads and writes | Implemented |
| 2.6 | GET APIs | Implemented, including filtering and pagination |
| 2.7 | POST APIs | Implemented with validation |
| 2.8 | PUT APIs | Implemented with ownership checks |
| 2.9 | Update and delete flows | Implemented |
| 2.10 | User, project, and collaboration relationships | Implemented |
| 2.11 | Username/password authentication | Implemented |
| 2.12 | JWT authentication and authorization | Implemented; browser session uses HttpOnly cookies |
| 2.13 | Third-party authentication | Google OAuth implemented; provider credentials and callback registration are required to use it |
| 2.14 | File upload and management | Implemented with type/signature/size checks; stored files are public URLs |
| 2.15 | Bruno API documentation | Collection implemented with local environment examples |
| 2.16 | Backend deployment | Render configuration and guide implemented; live deployment not performed |
| 2.17 | Frontend deployment | Vercel configuration and guide implemented; live deployment not performed |
| 2.18 | Jest testing | Unit/API suite passes locally; MongoDB integration tests are configured in CI, but require CI result verification |
| 2.19 | Dockerized deployment | Dockerfiles and Compose stack implemented; container build not verified in this environment |
| 2.20 | AI-assisted feature | Consent-based AI recommendations with local fallback; provider key required for live AI |
| 2.21 | Submission and technical defense | Documentation and demo walkthrough implemented |

## Stack

- **Frontend:** React, Vite, JavaScript
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** username/email and password, JWT, optional Google OAuth
- **API docs and operations:** Bruno, Docker Compose

## Repository layout

```text
backend/       Express API, models, middleware, services, and tests
frontend/      React application and reusable UI components
bruno/         Bruno collection and local environment example
docs/          Architecture, API, deployment, and defense notes
```

## Getting started

1. Install Node.js 20 or newer, npm, and Docker Desktop (or a local MongoDB 7+ server).
2. Copy `backend/.env.example` to `backend/.env` and set a MongoDB URI and a long JWT secret.
3. In `backend/`, run `npm ci`, then `npm run dev`.
4. In `frontend/`, run `npm ci`, then `npm run dev`.
5. Open the local URL printed by Vite. `/api/health` checks that the API process is alive; `/api/ready` returns HTTP 503 until MongoDB is connected.

Docker Compose instructions and deployment environment variables are documented in `docs/docker.md`, `docs/backend-deployment.md`, and `docs/frontend-deployment.md`.

## Contribution workflow

- Track each requirement in GitHub Issues and keep each PR focused on that requirement.
- Branch from the immediately previous requirement PR when work depends on it. Merge PRs in numeric order.
- Include a short summary, implementation notes, and verification steps in every PR.
- Do not commit `.env` files, secrets, generated uploads, or `node_modules`.
- Update the requirement status and technical notes when a feature is completed.

Use the **Bug report** and **Feature request** issue forms under GitHub Issues. Use the pull request template for implementation changes. The 21 requirement pull requests are stacked and should be reviewed and merged in order. Each numbered requirement should have a matching issue before its PR is merged.

The issue forms are ready, but the connected GitHub integration denied issue creation. Requirement issue records still need to be created in GitHub.

## Submission and defense

Read [the technical defense guide](docs/technical-defense.md) for the architecture, data model, security decisions, demo walkthrough, known setup requirements, and likely review questions. The app has been prepared for local use; cloud deployment, external OAuth, and live AI calls require credentials and service accounts that are not part of the source archive.

## Security notes

Use environment variables for secrets. Passwords are hashed before storage, JWTs are required for protected routes, and each write must verify record ownership. Never put real credentials in Bruno examples or commit history.
