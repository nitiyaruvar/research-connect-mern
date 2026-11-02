# File uploads

Authenticated users can upload PNG, JPEG, WebP, and PDF files with `POST /api/uploads`. The endpoint accepts a JSON data URL and returns an opaque file id and URL. Uploads are limited to 5 MB by default (up to 10 MB when explicitly configured), checked against their file signatures, and stored with a generated name. Original paths and file extensions are never used for disk paths.

Uploads are served from `/uploads/`. Those URLs are public, so only upload materials intended for public research profiles or project pages. PDFs download as attachments. Deleting an upload is allowed to its owner or an administrator; a file referenced by a profile or project must be detached first.

Set `UPLOAD_DIR` to durable storage in deployments. The default local directory is `backend/uploads/` and is excluded from Git.
