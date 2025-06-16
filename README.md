# EHR-ENG2 (Electronic Health Records System)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env
# Update DATABASE_URL with your Postgres credentials

# Start the backend server
node server/index.js

# Start the frontend development server
npm run dev

# Create a production build
npm run build
# Lint the code
npm run lint
```

## 🔑 Login Credentials

- Email: admin@example.com
- Password: password123

## 📱 Module Navigation

After successful login, users can access two main modules:
  Use the Back button in the header to return to the previous page.

1. **EH Module (Electronic Health)**
   - Access via `/eh-module` route
   - Manages electronic health records
   - Features:
    - Patient Management
    - Patient dashboard with add, view and edit actions
    - Marital status and blood type fields for patients
    - Automatic phone number formatting in forms
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

3. **Settings**
  - Access via `/settings` route
  - Visible only to admin users
  - Allows admins to change any user's password

4. **System Status**
  - Access via `/status` route
  - Displays API and database availability even when the database is offline

## 🏗️ Project Structure

```
ehr-eng2/
├── server/              # Backend server code
│   ├── routes/         # API route handlers
│   ├── db.js           # Database configuration
│   └── index.js        # Server entry point
├── src/                # Frontend source code
│   ├── components/     # Vue components
│   └── router/         # Vue router configuration
├── db/                 # Database migrations and schemas
└── public/            # Static assets
```

## 🔒 Security Features

- CORS protection
 - Password hashing with bcryptjs
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure session management
- Audit logging

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

### API Test Scripts

Use the provided scripts to verify API endpoints during development:

```bash
# Test login endpoint
npm run test:login

# Test patient list endpoint
npm run test:patients
```

## 📝 API Documentation

### Authentication Endpoints

#### POST /api/login
- Request body: `{ email: string, password: string }`
- Response: `{ success: boolean, role?: string, userId?: number, message?: string }`

### Patient Management Endpoints

#### GET /api/patients
- Returns list of all active patients
- Response: Array of patient objects

#### GET /api/patients/:id
- Returns single patient by ID
- Response: Patient object

#### POST /api/patients
- Creates new patient record
- Request body: Patient object
- Fields include first and last name, gender, marital status, blood type, date of birth and insurance info
- Response: Created patient object

#### PUT /api/patients/:id
- Updates existing patient record
- Request body: Updated patient object
- Same fields as patient creation
- Response: Updated patient object

#### DELETE /api/patients/:id
- Soft deletes patient record
- Response: Success message

#### GET /api/patients/search/:query
- Searches patients by name or insurance ID
- Response: Array of matching patient objects

### Health Endpoints

#### GET /api/v1/health/status
  - Returns `{ api: "online", database: "online" }` when services are healthy
  - Returns `{ api: "online", database: "offline" }` with status `503` if the database is down

### Admin Endpoints

#### GET /api/admin/users
  - Query parameters: `adminEmail`, `adminPassword`
  - Response: Array of `{ id, email }`

#### PUT /api/admin/users/:id/password
  - Request body: `{ adminEmail: string, adminPassword: string, newPassword: string }`
  - Response: `{ success: boolean }`

## 🛠️ Development

### Code Style
- Vue components use PascalCase
- JavaScript follows camelCase convention
- CSS uses Tailwind utility classes
- Follows ESLint configuration
- Phone numbers are stored as digits and formatted to `(XXX)-XXX-XXXX` in the UI
- Dashboard header text uses `dark:text-gray-200` for better readability
- Input fields in the Add Patient form use `text-gray-900`
  and `dark:text-gray-100` for better readability

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
