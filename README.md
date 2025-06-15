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
The server will load variables from a `.env` file if the `dotenv` package is installed. If `dotenv` is missing, set the variables manually before running `npm run dev:server`.

## Database Setup

1. Ensure PostgreSQL is installed and running.
2. Execute the schema script:
   ```bash
   psql -f db/schema.sql
   ```
   This creates the `ehr-eng2` database with `users` and `login_audit` tables.
   It also inserts a sample `admin@example.com` user with password `secret`.
3. Copy `.env.example` to `.env` and edit the values as needed.
4. Set `DATABASE_URL` to point at the new database before starting the server.

## Login Test

Start the backend with `npm run dev:server` then run this script to verify
login. The script reads
credentials from the `.env` file:

```bash
npm run test:login
```

If `dotenv` is missing, set `TEST_EMAIL` and `TEST_PASSWORD` in the environment before running the command. Ensure PostgreSQL is running and `DATABASE_URL` points to the database created by `db/schema.sql`.
The script posts to `http://localhost:3000/api/login` and prints the result.

## Database Setup

1. Ensure PostgreSQL is installed and running.
2. Execute the schema script:
   ```bash
   psql -f db/schema.sql
   ```
   This creates the `ehr-eng2` database with `users` and `login_audit` tables.
3. Set `DATABASE_URL` to point at the new database before starting the server.

## Contributing

Pull requests are welcome. Please keep documentation clear and run any available linters before opening a PR.

## License

MIT
