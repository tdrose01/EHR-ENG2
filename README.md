# EHR-ENG2 (Electronic Health Records System)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env
# Update DATABASE_URL with your Postgres credentials
  # Initialize the database
  psql -f db/init.sql
  # Apply migrations
  psql -f db/migrations/004_add_last_login_at.sql

# Start both frontend and backend servers
npm run start

# Stop both servers
npm run stop

# Create a production build
npm run build

# Lint the code
npm run lint
```

## 🔑 Login Credentials

- Email: admin@example.com
- Password: password123

**New:** The login form now includes a password visibility toggle. Click the eye (👁️) icon in the password field to show or hide your password as you type. This improves usability and helps prevent typos during login.

## 📱 Module Navigation

After successful login, users can access two main modules:
  Use the Back button in the header to return to the previous page.

1. **EH Module (Electronic Health)**
   - Access via `/eh-module` route
   - Manages electronic health records
   - Features:
    - Patient Management
    - Patient dashboard displays a DoD Id column with add, view and edit actions
    - View buttons open the patient detail page at `/patients/view/:id`
    - Complete patient information including:
      - Personal details (name, gender)
       - Medical information (blood type, RH factor)
       - Military information (duty status, paygrade, branch of service)
       - Demographics (ethnicity, religion)
       - Military IDs (PID, DoD ID)
  - Contact information (phone formatted as `(XXX)-XXX-XXXX`)
  - Automatic phone number formatting in forms and displays
     - Dark mode support with proper contrast and background
    - The `formatPhoneNumber` utility ensures numbers appear as `(XXX)-XXX-XXXX`.
     - Dark mode support with proper contrast
     - Medical Records
     - Appointment Scheduling
     - Environmental Dashboard for exposure tracking
     - Environment status cards with modal details
   - Blue-themed interface

2. **RH Module (Resource & Hospital)**
 - Access via `/rh-module` route
  - Manages hospital resources
  - Features (Coming Soon):
    - Staff Management
    - Equipment Tracking
    - Facility Management
  - Green-themed interface

3. **Settings**
  - Access via `/settings` route
  - Visible only to admin users
  - Allows admins to change any user's password

4. **System Status**
  - Access via `/status` route
  - Displays API and database availability
  - Real-time service health monitoring

## 🏗️ Project Structure

```
ehr-eng2/
├── server/              # Backend server code
│   ├── routes/         # API route handlers
│   ├── models/         # Database access logic
│   ├── db.js           # Database configuration
│   └── index.js        # Server entry point
├── db/                 # Database migrations and schemas
│   └── patients table with duty status, PID, paygrade, branch_of_service, ethnicity, religion, RH factor and DoD ID fields
├── src/                # Frontend source code
│   ├── components/     # Vue components (includes EHModulesScreen and EnvironmentalDashboard)
│                       # plus EnvironmentStatusCard
│   ├── composables/    # Reusable logic
│   ├── router/         # Vue router configuration
│   ├── assets/         # Static assets like images and fonts
│   ├── views/          # Top-level views/pages
│   └── main.js         # Main Vue application entry point
├── scripts/           # Server management scripts
└── public/            # Static assets (served by Vite)
```

## 🎨 UI/UX Features

- **Dark Mode Support**
  - Proper contrast in both light and dark modes
  - Readable text colors for all form fields
  - Consistent styling across components
  - Accessible color combinations
  - Top-level background switches to dark colors

- **Form Improvements**
- Enhanced input field visibility
  - Fixed dark mode contrast for the add patient form inputs
  - Structured patient information collection
  - Comprehensive dropdown options for:
    - Gender (Male, Female, Other)
    - Blood Type (A, B, AB, O)
    - RH Factor (Positive, Negative)
    - Duty Status (Active, Reserve, Retired)
    - Paygrade (E1-E8, O1-O4)
    - Branch of Service (Army, Navy, Air Force, Marines, Coast Guard, Space Force)
    - Ethnicity (Caucasian, African American, Hispanic, Asian, Pacific Islander, Native American, Mixed)
    - Religion (Christian, Catholic, Protestant, Buddhist, Hindu, Jewish, Muslim, Sikh, Orthodox, None)
  - Military-specific fields:
  - PID (Personnel ID)
  - DoD ID (Department of Defense ID)
  - Automatic phone number formatting
  - Last login timestamp is now only shown in the header card after authentication

## 🛠️ Development

### Code Style
- Vue components use PascalCase
- JavaScript follows camelCase convention
- CSS uses Tailwind utility classes
- Follows ESLint configuration
- Phone numbers are stored as digits and formatted to `(XXX)-XXX-XXXX` in forms and patient details
- Dashboard header text uses `dark:text-gray-200` for better readability
- Input fields in the Add Patient form now use `text-gray-900` and `dark:text-gray-100` for clear visibility in both themes

### Branch Strategy
- main: Production-ready code
- feature/*: New features
- bugfix/*: Bug fixes
- hotfix/*: Emergency fixes

## 📚 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support, email support@example.com or join our Slack channel.

## Last Login Timestamp Logic

  - The backend updates both the `last_login_at` and `last_login` columns in the `users` table on every successful login.
  - On login, the backend sets `last_login` to the previous value of `last_login_at`, then updates `last_login_at` to the current timestamp.
  - The previous value (now in `last_login`) is returned as `lastLogin` in the login API response and persisted as `lastLogin` for profile requests.
  - The frontend displays this value as the user's last login time in the header card. If no timestamp is present, it shows "First login".
  - Use `GET /api/users/:id` to fetch a user's profile with the `lastLogin` timestamp.

> **Note:** This logic is now fixed in the backend as of 2025-06-25.

### Troubleshooting Last Login Timestamp

If the last login timestamp is not displaying:
1. **Check the Database Schema:**
   - Ensure the `last_login_at` and `last_login` columns exist in the `users` table and are of type `timestamp`.
   - Confirm you are connected to the correct database (see `server/db.js`).
2. **Check Backend Logs:**
   - Look for messages like `last_login_at column missing, skipping update`. This means the backend cannot see the column.
   - Add debug logs to print the value fetched from the database.
3. **Restart the Backend:**
   - After making schema changes, always restart the backend server.
4. **Check API Response:**
   - Use browser DevTools to inspect the `/api/login` response and verify the `lastLoginAt` field.

### Common Pitfalls
- Backend and manual SQL client must connect to the same database instance.
- Schema changes must be applied to the correct database.
- The backend uses camelCase (`lastLoginAt`) in JSON, but the database uses snake_case (`last_login_at`).
- Improperly closed HTML tags can cause Vite build errors like `[vue/compiler-sfc] Unexpected token`. Ensure component templates are well-formed.

## Environmental Dashboard

### Features
- Displays air and water quality in user-friendly cards with color-coded status.
- Fetches real-time data from the backend `/api/environmental/latest` endpoint.
- Data is stored in the `environmental_data` table in PostgreSQL.
- Ready for chart integration (see below).
- Includes a `PatientCard` showing basic details from the electronic health module.

### Database Setup
1. **Run the migration:**
   ```sh
   psql -U postgres -d ehr_eng2 -f db/migrations/005_create_environmental_data.sql
   ```
2. **Insert sample data:**
   ```sql
   INSERT INTO environmental_data (pm25, pm10, o3, lead, arsenic, status_air, status_water)
   VALUES (15, 22, 0.04, 0.001, 0.0002, 'Good', 'Safe');
   ```

### Backend API
- **Route:** `GET /api/environmental/latest`
- **Returns:**
  ```json
  {
    "airQuality": { "pm25": 15, "pm10": 22, "o3": 0.04, "status": "Good" },
    "waterQuality": { "lead": 0.001, "arsenic": 0.0002, "status": "Safe" },
    "lastUpdated": "2025-06-25T14:07:56.401Z"
  }
  ```
- Returns 404 if no data is present.

### Frontend Usage
- The dashboard fetches and displays the latest data in cards.
- Status is color-coded (green for Good/Safe, yellow for Moderate, red for others).
- Last updated time is shown.
- Chart integration is ready (see below).

### Chart Integration
- To add charts, install Chart.js and vue-chartjs:
  ```sh
  npm install chart.js vue-chartjs
  ```
- Import and use in `EnvironmentalDashboard.vue` as needed.

### Troubleshooting
- If the dashboard says "Failed to fetch environmental data":
  - Ensure the backend route `/api/environmental/latest` is registered and the server is restarted.
  - Make sure the migration was run and there is at least one row in `environmental_data`.
  - Check the browser console and network tab for errors.

## 🆕 UI/UX Update (2025-06-25)

- The "Last login" information is now only displayed in the header card at the top of the app.
- The user email is no longer shown next to the logout button in the EH Module screen.
- All duplicate or footer displays of "Last login" have been removed for a cleaner interface.
- The Environmental Dashboard now has its own dedicated route (`/environmental-dashboard`) and card navigation, similar to Patient Management.
- The System Status page is restored to show system health and status as originally designed.

## Navy Environmental Health Tracker

### Database Setup
1. **Run the migration to create Navy tables:**
   ```sh
   psql -U postgres -d ehr_eng2 -f db/migrations/007_create_navy_tables.sql
   ```
2. **Insert sample Navy data:**
   ```sh
   psql -U postgres -d ehr_eng2 -f db/seed_navy_data.sql
   ```

### Backend API Endpoints
- `GET /api/navy/overview` — Returns summary stats for the Navy dashboard
- `GET /api/navy/exposure-events` — Returns all exposure events
- `GET /api/navy/bio-tests` — Returns all biological test results
- `GET /api/navy/med-surveillance` — Returns all medical surveillance compliance records
- `GET /api/navy/deployment-logs` — Returns all deployment environmental logs

### Frontend Usage
- The Navy Environmental Health Tracker dashboard fetches and displays data from these endpoints in real time.
- Data is color-coded and organized into cards and tables for easy review.

### Troubleshooting
- If the dashboard is empty, ensure you have run both the migration and the seed script above.
- Check the backend server logs for any errors related to the new endpoints or tables.
