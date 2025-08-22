# User Management System

The EHR-ENG2 system now includes a comprehensive user management system that allows administrators to create, manage, and assign roles to system users.

## Features

### User Creation
- Create new users with email and password
- Assign roles during creation
- Password validation (minimum 6 characters)
- Duplicate email prevention

### Role Management
- **Admin**: Full system access, can manage users and system settings
- **Manager**: Elevated access for managing specific modules
- **User**: Standard access to assigned modules
- **Viewer**: Read-only access to assigned modules

### User Operations
- View all system users
- Edit user roles
- Delete users (with protection for last admin)
- Track user creation and last login dates

## Access

### Navigation
1. Login as an admin user
2. Navigate to the main dashboard (`/select-module`)
3. Click on "User Management" in the top navigation bar
4. Or click the "Manage Users" card on the dashboard

### URL
Direct access: `/admin/users`

## API Endpoints

### Create User
```
POST /api/admin/users
```
**Body:**
```json
{
  "adminEmail": "admin@example.com",
  "adminPassword": "admin_password",
  "email": "newuser@example.com",
  "password": "user_password",
  "role": "user"
}
```

### List Users
```
POST /api/admin/users/list
```
**Body:**
```json
{
  "adminEmail": "admin@example.com",
  "adminPassword": "admin_password"
}
```

### Update User Role
```
PUT /api/admin/users/:id/role
```
**Body:**
```json
{
  "adminEmail": "admin@example.com",
  "adminPassword": "admin_password",
  "newRole": "manager"
}
```

### Delete User
```
DELETE /api/admin/users/:id
```
**Body:**
```json
{
  "adminEmail": "admin@example.com",
  "adminPassword": "admin_password"
}
```

### Get Available Roles
```
GET /api/admin/roles
```

## Security Features

### Authentication Required
- All user management operations require admin authentication
- Admin credentials must be provided for each operation
- Session-based authentication with localStorage

### Role Validation
- Only valid roles can be assigned: `admin`, `manager`, `user`, `viewer`
- Role changes are logged and validated
- Protection against deleting the last admin user

### Password Security
- Passwords are hashed using bcrypt
- Minimum password length enforcement
- Secure password storage in database

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

## Usage Examples

### Creating a New Manager
1. Navigate to User Management
2. Fill in the create user form:
   - Email: `manager@example.com`
   - Password: `secure_password_123`
   - Role: `manager`
   - Admin Password: `your_admin_password`
3. Click "Create User"

### Changing a User's Role
1. In the users table, click "Edit" next to the user
2. Select the new role from the dropdown
3. Click "Update"

### Deleting a User
1. In the users table, click "Delete" next to the user
2. Confirm the deletion in the popup dialog

## Error Handling

### Common Errors
- **Admin credentials required**: Ensure you're logged in as admin
- **User already exists**: Email address is already in use
- **Invalid role**: Role must be one of the predefined options
- **Cannot delete last admin**: System prevents deletion of the last admin user

### Troubleshooting
- Check that you're logged in with admin privileges
- Verify admin password is correct
- Ensure email format is valid
- Check password meets minimum requirements

## Testing

Run the user management tests:
```bash
npm test tests/user-management.test.js
```

## Future Enhancements

- User activity logging
- Password reset functionality
- Bulk user operations
- Advanced role permissions
- User group management
- Audit trail for user changes
