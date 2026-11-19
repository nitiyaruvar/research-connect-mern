## JWT authentication

Set `MONGO_URI` and `JWT_SECRET` in the backend environment before starting the API.

`POST /api/auth/register` and `POST /api/auth/login` return a JWT. Send it on protected requests with:

```text
Authorization: Bearer <token>
```

The `/api/auth/me`, `/api/users`, `/api/projects`, and `/api/collaboration-requests` endpoints require a valid, non-expired token. Project creation uses the authenticated user as its owner, and project changes are limited to that owner. Collaboration requests use the authenticated user as sender, and updates are limited to their sender or recipient.
# Research Networking Platform

## Overview

Researchers working on related topics often remain unaware of potential collaboration opportunities within their own institutions. This leads to duplicated efforts, missed interdisciplinary partnerships, and slower innovation.

The **Research Networking Platform** is designed to bridge this gap by connecting researchers, faculty members, scholars, and students based on their research interests, publications, expertise, and ongoing projects. The platform helps users discover potential collaborators, explore research activities across departments, and encourage interdisciplinary innovation.

---

## Problem Statement

In many universities and research institutions, researchers operate within departmental silos. As a result:

- Researchers are unaware of similar work happening in other departments.
- Collaboration opportunities are often missed.
- Interdisciplinary research projects are difficult to initiate.
- Research resources and expertise remain underutilized.
- Duplicate research efforts may occur due to lack of visibility.

A centralized platform is needed to improve research discoverability and collaboration.

---

## Proposed Solution

The Research Networking Platform provides a centralized environment where researchers can:

- Create and manage professional research profiles.
- Showcase research interests, publications, and projects.
- Discover researchers with similar or complementary expertise.
- Search research topics across departments.
- Receive collaboration recommendations.
- Connect and communicate with potential collaborators.

By making institutional research more visible and accessible, the platform promotes innovation and knowledge sharing.

---

## Objectives

- Increase awareness of ongoing research within institutions.
- Promote interdisciplinary collaboration.
- Reduce duplication of research efforts.
- Facilitate networking among researchers.
- Provide intelligent recommendations for potential partnerships.
- Improve accessibility to research information.

---

## Key Features

### Researcher Profiles
- Personal and academic information.
- Research interests and areas of expertise.
- Publications and achievements.
- Current and completed projects.

### Smart Research Discovery
- Search researchers by keywords, domain, department, or expertise.
- Browse ongoing and completed research projects.

### Collaboration Recommendations
- Suggest potential collaborators based on:
  - Research interests
  - Keywords
  - Publication topics
  - Skills and expertise

### Project Showcase
- Display active and completed research projects.
- Highlight project goals, outcomes, and contributors.

### Communication System
- Send collaboration requests.
- Connect with researchers across departments.

### Research Analytics Dashboard
- Track collaboration trends.
- View research activity and engagement metrics.

---

## Target Users

- Researchers
- Faculty Members
- PhD Scholars
- Postgraduate Students
- Research Administrators
- Academic Institutions

---

## Technology Stack

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL / MongoDB

### Authentication
- JWT Authentication
- Role-Based Access Control

### Additional Tools
- Git & GitHub
- REST APIs

## Backend setup

1. Install dependencies in `backend` with `npm install`.
2. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` and a private `JWT_SECRET`.
3. Start the API with `npm start` or `npm run dev`.

### Username and password authentication

The API exposes:

- `POST /api/auth/register` with `username`, `name`, `email`, and `password`.
- `POST /api/auth/login` with `username` and `password`.
- `GET /api/auth/me` with an `Authorization: Bearer <token>` header.

Passwords are hashed with bcrypt before storage. Successful registration and login return a one-day JWT and a public user profile; the password is never returned.

To verify JWT authorization manually:

1. Register or sign in and copy the `token` from the response.
2. Request `GET /api/auth/me` with `Authorization: Bearer <token>`; a valid token returns the authenticated user.
3. Repeat the request without the header, or with an invalid/expired token; the API returns `401 Unauthorized`.

The backend models users, research projects, and collaboration requests. References connect project owners and collaborators, while each collaboration request stores its sender, recipient, optional project, message, and status.

---

## System Workflow

1. User registers and creates a research profile.
2. Research interests and expertise are added.
3. Research data is stored in the database.
4. Users search for researchers or projects.
5. Recommendation engine identifies potential collaborators.
6. Users connect and initiate collaborations.
7. Research outcomes and projects are shared on the platform.

---

## Expected Outcomes

- Increased interdisciplinary research collaborations.
- Better visibility of institutional research activities.
- Improved knowledge sharing among researchers.
- Enhanced innovation through cross-domain partnerships.
- Stronger research ecosystem within institutions.

---

## Future Enhancements

- AI-powered collaboration recommendations.
- Integration with Google Scholar and ORCID.
- Publication citation analysis.
- Research funding opportunity recommendations.
- Real-time messaging and discussion forums.
- Research event and conference tracking.

---

## Conclusion

The Research Networking Platform aims to create a collaborative research ecosystem by connecting researchers with shared interests and complementary expertise. By improving visibility, communication, and collaboration opportunities, the platform can help institutions unlock greater innovation and research impact.  