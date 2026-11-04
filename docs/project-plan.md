# Module 2 delivery plan

Each numbered requirement has its own stacked pull request. The issue forms are ready for tracking work; create and link the requirement issues as access permits. Merge the pull requests in order because the frontend, schemas, endpoints, and deployment files build on earlier work.

| Requirement | Pull request scope |
| --- | --- |
| 2.1 | README, contribution flow, issue and PR templates |
| 2.2 | React app setup, scripts, environment configuration |
| 2.3 | Reusable React interface and user interactions |
| 2.4 | MongoDB schemas and indexes |
| 2.5 | Database connection and persistence operations |
| 2.6 | GET endpoints, filtering, pagination |
| 2.7 | POST endpoints and input validation |
| 2.8 | PUT endpoints and ownership validation |
| 2.9 | Delete flows and user confirmation |
| 2.10 | User, project, and collaboration relationships |
| 2.11 | Password registration and login |
| 2.12 | JWT middleware and authorization |
| 2.13 | Configurable Google OAuth |
| 2.14 | Upload validation, storage, and removal |
| 2.15 | Bruno collection and safe local environment |
| 2.16 | Backend production setup and deployment guide |
| 2.17 | Frontend production build and deployment guide |
| 2.18 | Jest and Supertest coverage |
| 2.19 | Dockerfiles and Compose environment |
| 2.20 | Optional AI recommendations with fallback |
| 2.21 | Submission, demo, and technical defense documentation |

## Current completion and external dependencies

The repository code for requirements 2.1–2.21 is present in the stacked pull requests. The requirements are not all operationally complete until their external steps are done: create the 21 matching GitHub issues (the GitHub integration denied issue writes during this work), configure and launch Render/Vercel/MongoDB, supply optional Google OAuth and AI credentials, run the Docker stack, and review CI results for the current head commit. Deployment configuration is not the same as a live deployment. See the status table in the root README for the current breakdown.

## Review checklist

- [ ] The corresponding feature is implemented in focused modules.
- [ ] API inputs and errors are handled clearly.
- [ ] Secrets and generated files are excluded from Git.
- [ ] Automated checks for the feature pass.
- [ ] README status and technical notes are current.
