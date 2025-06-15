# Electronic Health Record (EHR) System

A modern, HIPAA-compliant Electronic Health Record system built with Vue.js and Node.js, following industry best practices and security standards.

## 🚀 Features

- **Secure Authentication System**
  - JWT-based authentication
  - Password hashing with bcrypt
  - Session management
  - Audit logging for login attempts

- **Modular Architecture**
  - EH Module (Electronic Health Records Management)
  - RH Module (Resource & Hospital Management)
  - Clear separation of concerns
  - Component-based design

## 🛠️ Technology Stack

### Frontend
- Vue.js 3 with Composition API
- Vue Router for navigation
- Tailwind CSS for styling
- Modern, responsive UI components
- Accessibility-compliant design (WCAG 2.1 AA)

### Backend
- Node.js with Express
- PostgreSQL database
- bcrypt for password hashing
- CORS enabled for secure communication
- Environment-based configuration

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/EHR-ENG2.git
   cd EHR-ENG2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with:
   ```env
   DATABASE_URL=postgresql://web:webpass@localhost:5432/ehr-eng2
   PORT=3000
   ```

4. **Set up the database**
   ```bash
   # Connect to PostgreSQL and run the schema
   psql -U postgres -f db/schema.sql
   ```

## 🚀 Running the Application

1. **Start the backend server**
   ```bash
   npm run start:server
   ```
   The server will run on http://localhost:3000

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:5173

## 🔐 Authentication

Default test credentials:
- Email: admin@example.com
- Password: password123

## 📱 Module Navigation

After successful login, users can access two main modules:

1. **EH Module (Electronic Health)**
   - Access via `/eh` route
   - Manages electronic health records
   - Blue-themed interface

2. **RH Module (Resource & Hospital)**
   - Access via `/rh` route
   - Manages hospital resources
   - Green-themed interface

## 🔒 Security Features

- CORS protection
- Password hashing with bcrypt
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

## 📝 API Documentation

### Authentication Endpoints

#### POST /api/login
- Request body: `{ email: string, password: string }`
- Response: `{ success: boolean, message?: string }`

## 🛠️ Development

### Code Style
- Vue components use PascalCase
- JavaScript follows camelCase convention
- CSS uses Tailwind utility classes
- Follows ESLint configuration

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
