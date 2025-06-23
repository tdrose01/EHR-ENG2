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
   - Blue-themed interface

2. **RH Module (Resource & Hospital)**
 - Access via `/rh-module` route
  - Manages hospital resources
  - Features (Coming Soon):
    - Staff Management
    - Equipment Tracking
    - Facility Management
  - Green-themed interface

3. **Exposure Dashboard**
  - Access via `/eh/exposure-dashboard` route
  - Tracks environmental hazards and sample testing
  - Purple-themed interface
4. **Settings**
  - Access via `/settings` route
  - Visible only to admin users
  - Allows admins to change any user's password

5. **System Status**
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
├── src/                # Frontend source code
│   ├── components/     # General Vue components
│   ├── modules/        # Module-specific components
│   │   └── eh/         # EH (Electronic Health) module
│   │       └── components/ # Components for EH module
│   │           └── dashboard/ # Exposure Dashboard components
│   │           └── components/ # Components for EH module
│   ├── router/         # Vue router configuration
│   ├── assets/         # Static assets like images and fonts
│   ├── views/          # Top-level views/pages
│   └── main.js         # Main Vue application entry point
├── db/                 # Database migrations and schemas
│   └── patients table with duty status, PID, paygrade, branch_of_service, ethnicity, religion, RH factor and DoD ID fields
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
  - Last login timestamp shown after authentication

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

  - The backend updates the `last_login_at` column in the `users` table on every successful login.
  - The server first queries the existing value, then updates the column. That previous timestamp is returned as `lastLoginAt` in the login API response.
  - The frontend displays this value as the user's last login time. If `lastLoginAt` is `null`, it shows "First login".

### Troubleshooting Last Login Timestamp

If the last login timestamp is not displaying:
1. **Check the Database Schema:**
   - Ensure the `last_login_at` column exists in the `users` table and is of type `timestamp with time zone`.
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
