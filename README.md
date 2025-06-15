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
3. Start the development servers:
   ```bash
   # Start the backend server (runs on port 3000)
   npm run start:server
   
   # In a separate terminal, start the frontend server (default port 5173)
   npm run dev
   ```
4. Build the application for production:
   ```bash
   npm run build
   ```

## Server Configuration

### Backend Server (Express)
The server runs on port 3000 and connects to PostgreSQL using the `pg` library.

#### Start the backend server
```bash
npm run start:server
```

#### Stop the backend server
```bash
npm run stop:server
```
This uses [`kill-port`](https://www.npmjs.com/package/kill-port) to stop the server on port 3000 (cross-platform).

### Frontend Server (Vite)
The development server typically runs on port 5173. If this port is in use, Vite will automatically try the next available port (e.g., 5174).

### Environment Variables
The backend server requires the following environment variables:

1. Create a `.env` file in the project root:
   ```
   DATABASE_URL=postgres://user:password@localhost:5432/database
   ```
2. Install the `dotenv` package if not already installed:
   ```bash
   npm install dotenv
   ```

## Troubleshooting

### Common Issues

1. **"vite not recognized" error**
   - Solution: Install Vite dependencies
     ```bash
     npm install
     ```

2. **Port already in use**
   - For backend (port 3000):
     ```bash
     npm run stop:server
     ```
   - For frontend: Vite will automatically try the next available port

3. **404 Errors**
   - Verify the correct ports:
     - Backend API: http://localhost:3000
     - Frontend: http://localhost:5173 (or alternative port shown in terminal)
   - Ensure both servers are running in separate terminals

4. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Ensure database user has proper permissions

## Database Setup

1. Install PostgreSQL (on Ubuntu/Debian):
   ```bash
   sudo apt-get update
   sudo apt-get install postgresql
   ```
   Start the database service with `sudo service postgresql start`.
2. Execute the schema script:
   ```bash
   sudo -u postgres psql -f db/schema.sql
   ```
   This creates the `ehr-eng2` database and example tables.
3. Create a dedicated user and grant privileges:
   ```bash
   sudo -u postgres psql -c "create user web with password 'webpass';"
   sudo -u postgres psql -c "grant all privileges on database \"ehr-eng2\" to web;"
   sudo -u postgres psql ehr-eng2 -c "grant all privileges on all tables in schema public to web;"
   sudo -u postgres psql ehr-eng2 -c "grant all privileges on all sequences in schema public to web;"
   ```
4. Copy `.env.example` to `.env` and update `DATABASE_URL` using that new user, e.g.:
   ```
   DATABASE_URL=postgres://web:webpass@localhost:5432/ehr-eng2
   ```

## Login Test

Start the backend with `npm run dev:server` then run this script to verify
login. The script reads credentials from the `.env` file:

```bash
npm run test:login
```

If `dotenv` is missing, set `TEST_EMAIL` and `TEST_PASSWORD` in the environment before running the command. Ensure PostgreSQL is running and `DATABASE_URL` points to the database created by `db/schema.sql`.
The script posts to `http://localhost:3000/api/login` and prints the result.

## Contributing

Pull requests are welcome. Please keep documentation clear and run any available linters before opening a PR.

## License

MIT
