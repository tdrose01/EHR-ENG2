# EHR-ENG2

A modern Electronic Health Records (EHR) frontend application built with Vue, Vite, and Tailwind CSS.

## Overview

EHR-ENG2 provides a simple starting point for building an EHR interface with the Vue 3 ecosystem. The project relies on Vite for rapid development and Tailwind CSS for utility-first styling.

## Project Structure

- `AGENTS.md` – contribution guidelines for this repository.
- `README.md` – project documentation and setup instructions.
- `node_modules/` – installed dependencies. Changes to this folder should not be committed.
- `.git/` – version control files managed by Git.
- `src/components/LoginLanding.vue` – example login landing page component.
- `server/index.js` – minimal Express server connecting to PostgreSQL.

## Getting Started

1. Install Node.js (version 18 or later recommended).
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build the application for production:
   ```bash
   npm run build
   ```

## Backend Server

The server in `server/index.js` connects to a PostgreSQL database using the `pg` library. Set the `DATABASE_URL` environment variable and run:

```bash
  npm install
  npm run dev:server
```

The `/api/login` endpoint accepts `email` and `password` fields for authentication.

## Contributing

Pull requests are welcome. Please keep documentation clear and run any available linters before opening a PR.

## License

MIT
