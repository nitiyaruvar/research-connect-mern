# Research Connect

Research Connect is a MERN application for finding researchers, sharing projects, and starting collaborations across departments.

## Project status

This repository is being developed against the Module 2 product requirements. Work is organized as one pull request per numbered requirement; the PRs are intended to be reviewed and merged in order because later work builds on earlier APIs and schemas.

| Requirement | Scope | Status |
| --- | --- | --- |
| 2.1 | Repository docs and contribution workflow | In progress |
| 2.2 | React setup | Planned |
| 2.3 | React components | Planned |
| 2.4–2.10 | MongoDB models, operations, APIs, CRUD, relationships | Planned |
| 2.11–2.13 | Password, JWT, and Google OAuth authentication | Planned |
| 2.14 | File uploads | Planned |
| 2.15 | Bruno API collection | Planned |
| 2.16–2.17 | Backend and frontend deployment | Planned |
| 2.18 | Jest API tests | Planned |
| 2.19 | Docker deployment | Planned |
| 2.20 | AI-assisted recommendations | Planned |
| 2.21 | Submission and technical defense guide | Planned |

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

1. Install Node.js 20 or newer, npm, and Docker Desktop (or a local MongoDB server).
2. Copy `backend/.env.example` to `backend/.env` and set a MongoDB URI and a long JWT secret.
3. In `backend/`, run `npm install`, then `npm run dev`.
4. In `frontend/`, run `npm install`, then `npm run dev`.
5. Open the local URL printed by Vite. The API health endpoint is `/api/health`.

Docker Compose instructions and deployment environment variables are documented in `docs/deployment.md` as those requirements are implemented.

## Contribution workflow

- Pick an issue labeled with its requirement number and keep each PR focused on that requirement.
- Branch from the immediately previous requirement PR when work depends on it. Merge PRs in numeric order.
- Include a short summary, implementation notes, and verification steps in every PR.
- Do not commit `.env` files, secrets, generated uploads, or `node_modules`.
- Update the requirement status and technical notes when a feature is completed.

Use the **Bug report** and **Feature request** issue forms under GitHub Issues. Use the pull request template for implementation changes.

## Security notes

Use environment variables for secrets. Passwords are hashed before storage, JWTs are required for protected routes, and each write must verify record ownership. Never put real credentials in Bruno examples or commit history.
