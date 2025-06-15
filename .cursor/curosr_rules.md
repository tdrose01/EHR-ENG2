Cursor IDE Rules File
This document outlines the coding standards, best practices, and operational guidelines for our Engineering Electronic Health Record (EHR) project. It serves as the definitive reference for all developers working on the project to ensure consistency, readability, maintainability, and security across the codebase.

1. General Guidelines
Coding Style:

Python: Follow PEP8 guidelines strictly (4 spaces for indentation, snake_case for variable and function names, maximum line length of 88 characters).

JavaScript/Vue: Use camelCase for variable and method names, PascalCase for components and classes, and maintain consistent formatting with ESLint configuration.

All Languages: Configure and use appropriate linters in your IDE to enforce style guidelines automatically.

Comments & Documentation:

All functions, classes, and modules must have descriptive docstrings or comments explaining purpose, parameters, and return values.

Update the documentation in the /docs folder whenever functional changes are made.

Document complex algorithms with explanations of logic and time/space complexity considerations.

Include examples for non-trivial code usage.

Version Control:

Write meaningful commit messages following the convention: <type>(<scope>): <description> (e.g., "feat(auth): implement JWT token refresh").

Maintain branch discipline: use feature/, bugfix/, hotfix/ prefixes with descriptive branch names.

Ensure code reviews are performed for every pull request with at least one approving reviewer.

Regularly rebase feature branches on main to minimize merge conflicts.

2. Security Practices
Credentials & Secrets:

Always use environment variables for sensitive information, leveraging a secure secrets management system.

Never commit passwords, API keys, tokens, or secrets in the code repository.

Implement key rotation policies and document procedures for credential management.

Use a .env.example file to document required environment variables without actual values.

User Input:

Validate and sanitize all user inputs on both client and server sides.

Implement input validation schemas using appropriate libraries (e.g., Pydantic for Python, Joi for JavaScript).

Follow OWASP guidelines for preventing XSS, CSRF, and injection attacks.

Implement proper error handling that doesn't expose sensitive information.

API Security:

Use HTTPS for all API calls with properly configured TLS certificates.

Implement token-based authentication (e.g., JWT) with appropriate expiration periods.

Apply principle of least privilege for API access controls.

Implement rate limiting and monitoring for suspicious activity patterns.

Ensure CORS is properly configured for frontend-backend communication.

HIPAA Compliance:

Follow all relevant HIPAA Security Rule requirements for PHI protection.

Implement audit logging for all data access operations involving patient information.

Ensure data is encrypted both in transit and at rest.

3. Testing & Debugging
Unit Testing:

Write comprehensive unit tests for each function, API endpoint, and critical component.

Aim for at least 80% test coverage, with higher coverage for critical paths.

Make tests deterministic and independent of environment variables when possible.

Include positive, negative, and edge cases in test scenarios.

Integration and E2E Testing:

Implement integration tests for API endpoints and service interactions.

Use end-to-end testing for critical user flows in the application.

Automate browser testing for frontend components when appropriate.

Debugging:

Integrate mcp servers by claude ai for robust monitoring and debugging of microservices.

Use structured logging with consistent formats (timestamp, log level, service name, correlation ID).

Implement appropriate log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL) based on message importance.

Configure centralized log collection and analysis.

CI/CD:

Utilize continuous integration to run tests, linters, and security scans on each commit.

Implement staged deployments with automated rollback capabilities.

Ensure test environments mirror production configurations as closely as possible.

Document deployment procedures and maintain deployment scripts in version control.

4. Code Organization & Project Structure
Backend (Python Microservices):

Separate API routes, database models, utility functions, and business logic into distinct modules.

Use clear, RESTful endpoint naming conventions that reflect resource-action patterns.

Follow a layered architecture (controllers, services, repositories) to separate concerns.

Document inter-service dependencies and communication patterns.

Containerize services using Docker with optimized images.

Frontend (Vue.js):

Organize components logically (e.g., separate components for Login, Dashboard, Patients).

Use atomic design principles: divide components into atoms, molecules, organisms, templates, and pages.

Maintain a clean and centralized router configuration with proper route guards.

Implement lazy-loading for routes to improve initial load performance.

Follow a consistent pattern for component file organization.

Database:

Use an ORM (e.g., SQLAlchemy) for all database interactions.

Keep migrations versioned and documented with clear descriptions of changes.

Implement database access through repository patterns to abstract data access logic.

Design schemas with appropriate normalization and indexing strategies.

Document entity relationships with ERD diagrams in the project documentation.

Folder Structure:

Follow the defined structure for backend, frontend, and docs to improve maintainability.

Document the purpose of each top-level directory in a README file.

Group related files together to minimize context switching during development.

5. Frontend-Specific Guidelines
Vue Components:

Write single-file components with clear separation of template, script, and style sections.

Utilize Tailwind CSS for rapid UI development, adhering to utility class conventions.

Keep components focused on a single responsibility (high cohesion, low coupling).

Use props validation and provide appropriate default values.

Document component APIs with detailed prop descriptions.

Implement consistent error handling for API calls and user interactions.

State Management:

Use Vue's composition API or Vuex (as applicable) for managing application state.

Document the state structure and mutation patterns.

Organize store modules by domain/feature rather than technical concerns.

Implement proper error states and loading indicators tied to async operations.

Follow immutable state update patterns for predictable state transitions.

Routing:

Keep frontend routes synchronized with backend API endpoints.

Implement proper authentication and authorization guards for routes.

Use nested routes when appropriate to represent hierarchical data.

Document route parameters and query string expectations.

Accessibility:

Ensure components meet WCAG 2.1 AA standards at minimum.

Use semantic HTML elements appropriately.

Implement keyboard navigation support for all interactive elements.

Test with screen readers and provide appropriate ARIA attributes where needed.

6. API & Database Conventions
API Guidelines:

Use versioned endpoints (e.g., /api/v1/login) and document them in Swagger (FastAPI's /docs).

Provide clear error messages and appropriate HTTP status codes.

Implement consistent response formats for success and error cases.

Support pagination, filtering, and sorting for collection endpoints.

Document rate limits and authentication requirements clearly.

Use appropriate HTTP methods (GET, POST, PUT, PATCH, DELETE) based on the operation.

Database:

Use consistent naming for tables and columns (snake_case for PostgreSQL).

Document primary keys, foreign keys, and indexes in schema descriptions.

Regularly back up the database and follow best practices for schema migrations.

Implement appropriate indexes for frequently queried fields.

Use database transactions appropriately to maintain data integrity.

Document database performance considerations and query optimization strategies.

7. Documentation & References
Internal Documentation:

Maintain up-to-date architecture diagrams in the /docs directory.

Document API contracts and data models with clear examples.

Include onboarding guides for new developers to the project.

Document known issues, workarounds, and technical debt.

External References:

Core Technologies
Python Microservices (FastAPI):
FastAPI Documentation

Vue.js:
Vue.js Documentation

Tailwind CSS:
Tailwind CSS Documentation

PostgreSQL:
PostgreSQL Documentation

Docker:
Docker Documentation

mcp servers by claude ai:
mcp servers by claude ai Documentation

Testing & Quality Assurance
Jest (JavaScript Testing):
Jest Documentation

Pytest (Python Testing):
Pytest Documentation

Cypress (E2E Testing):
Cypress Documentation

ESLint (JavaScript Linting):
ESLint Documentation

Pylint (Python Linting):
Pylint Documentation

Security Resources
OWASP Top Ten:
OWASP Top Ten

JWT Authentication:
JWT Introduction

HIPAA Security Rule:
HHS HIPAA Security Rule

Web Security Guidelines:
Mozilla Web Security Guidelines

Python Security Best Practices:
OWASP Python Security

Healthcare Data Standards
FHIR (Fast Healthcare Interoperability Resources):
HL7 FHIR Documentation

HL7 Standards:
HL7 Standards

SNOMED CT:
SNOMED International

LOINC:
LOINC Documentation

ICD-10:
ICD-10-CM Documentation

Accessibility
Web Content Accessibility Guidelines (WCAG):
WCAG Overview

WAI-ARIA:
WAI-ARIA Overview

Accessible Rich Internet Applications:
MDN Accessibility Documentation

Vue.js Accessibility:
Vue.js Accessibility Guide

Performance Optimization
Web Performance:
Web.dev Performance

Core Web Vitals:
Web Vitals Documentation

Vue.js Performance:
Vue.js Performance Optimization

Python Performance:
Python Performance Tips

Database Performance:
PostgreSQL Performance Optimization

8. Performance & Optimization
Code Optimization:

Strive for clarity and performance; refactor code regularly to avoid unnecessary complexity.

Profile application performance to identify bottlenecks before optimization.

Document performance-critical paths in the application.

Follow best practices for minimizing database query load (N+1 query problems).

Implement appropriate caching strategies for frequently accessed data.

Frontend Performance:

Optimize bundle size using code splitting and lazy loading.

Minimize render blocking resources and implement critical CSS strategies.

Optimize asset loading (images, fonts, scripts) with proper caching headers.

Follow Core Web Vitals guidelines for user experience metrics.

Monitoring:

Utilize mcp servers by claude ai to track performance metrics and promptly address bottlenecks.

Implement application performance monitoring (APM) for both frontend and backend.

Set up alerts for critical performance thresholds.

Regularly review performance metrics and establish baselines.

Document performance testing methodologies and tools.

9. Final Remarks
Adhering to these rules will help maintain a high-quality, secure, and efficient codebase. Regular updates to this document should be made as new best practices are identified or as the project evolves. All team members are encouraged to suggest improvements to these guidelines through the standard code review process.

Remember that these standards exist to facilitate development and collaboration, not to impede progress. When exceptions to these guidelines are necessary, document the reasoning clearly in code comments and pull request descriptions.

For questions or clarifications regarding these standards, please contact the project's technical lead or architect.