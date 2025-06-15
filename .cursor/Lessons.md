# Lessons Learned from MCP PostgreSQL Testing

## Database Configuration and Setup

- PostgreSQL connection string format: `postgresql://postgres:postgres@localhost:5432/ehr_test`
- Always check if the PostgreSQL server is running before running tests with `pg_isready`
- The MCP tests require specific database tables: `patients`, `records`, and `users`
- Running both the PostgreSQL server and other HTTP services on the same machine can cause port conflicts

## Schema and Data Structure

- The database schema uses a single `name` field rather than separate `firstName`/`lastName` fields
- Database column names don't always match the frontend model property names (e.g., `name` vs `firstName`/`lastName`)
- Always check the actual schema before writing assertions by using `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patients'`
- Add an inspection test to analyze the format of database records before writing detailed assertions

## Test Structure Best Practices

- Use safe assertions when testing database schema (e.g., check if a column exists before asserting it)
- Don't rely on LIMIT/OFFSET working exactly as expected in test environments - results may vary
- Add proper error handling and database cleanup after tests
- Add detailed logging of database query results for debugging purposes
- Separate test setup from test assertions for better maintainability
- Include schema verification steps before running database-dependent tests
- Mock network errors explicitly to test fallback behavior

## Common Issues and Solutions

- Network errors in console output are often informational and don't necessarily indicate test failures
- Path resolution problems can be fixed by using correct import paths relative to project structure
- Authentication token is required for API requests and must be properly set in headers
- Use explicit WHERE clauses in SQL queries (e.g., `table_schema = 'public'`) to avoid ambiguous results
- When tests fail due to missing properties, first check if the property exists in the schema
- Placeholder components can solve import errors in the router configuration
- Differences between unit test mocks and actual database schema cause most test failures
- Tests pass with expected errors when those errors are part of the test design

## Performance Considerations

- PostgreSQL settings to check: max_connections, shared_buffers, effective_cache_size
- Average query time around 2.5ms with cache hit ratio of 0.98 is good performance
- Use smaller batches for data import/export operations
- Dev server instances can accumulate and consume ports (8080-8090+)

## Test Command Structure

- Individual test commands like `npm run test:mcp:patient-search` are more useful for debugging
- Full test suite can be run with `npm run test:mcp`
- Database setup and teardown should be part of the test process
- Test commands should be documented in a README or dedicated testing document

## Vue Application Structure

- When files are referenced in router configuration but don't exist in the project, the app will fail to start
- Check for missing route component files by examining the router configuration (router/index.js)
- Create placeholder components for routes that are defined but don't have corresponding view files
- For external resources (like images), use reliable sources or placeholder services (e.g., https://via.placeholder.com)
- The development server will attempt to use alternative ports if the default ones (5173, 8080) are already in use
- When creating new Vue components, follow the existing project structure and styling conventions
- Use Base64-encoded images when actual image files aren't available or during initial development

## API and Services

- Check for missing services when import statements reference services that don't exist (e.g., `dashboardService` in api.js)
- Implement fallback data or mock responses in service functions to handle API errors gracefully
- Return properly formatted mock data to match the expected structure of API responses
- Always include error handling in service functions to prevent app crashes when APIs are unavailable
- Use environment variables for API endpoints to make the app configurable for different environments
- Keep token naming consistent across the application (e.g., using 'ehrToken' everywhere)
- Provide fallback credentials for testing environments
- Fix infinite loading spinner issues by ensuring API responses are properly normalized and validated before use
- Don't delay loading critical data with setTimeout as it can cause UI elements to remain in loading state indefinitely
- Add detailed logging to troubleshoot API response format mismatches
- Always check for null and undefined before accessing properties of API responses
- Implement timeout mechanisms for loading spinners to provide user feedback when operations take too long
- When using v-for with v-else conditions, ensure the v-else is properly placed on the containing element not individual list items

## Development Environment

- Kill unused development servers to prevent port exhaustion
- Use `lsof -i :8080` (Linux/Mac) or `netstat -ano | findstr :8080` (Windows) to find processes using specific ports
- Document the expected state of external services (PostgreSQL, API servers) needed for testing
- Keep test data consistent between unit tests and integration tests to avoid confusion
- When running both an API server and a dev server, configure CORS or use a proxy in development

## UI Components

- Add built-in timeout handling to reusable loading components to prevent them from getting stuck
- Implement retry mechanisms for failed operations to enhance user experience
- Use defensive programming in computed properties to handle edge cases (empty arrays, null values)
- Validate data before performing operations like sorting or pagination to prevent errors
- Include detailed console logging during development to help trace issues with component rendering
- Always provide fallback content when data might be unavailable (e.g., 'N/A' for missing fields)
- Reset pagination to page 1 when filters or data sources change to avoid invalid page states
- When implementing search functionality, use both event handlers: `@input` with debounce for typing and `@keyup.enter` for immediate search on Enter key press
- Use `.stop` modifier with click events in table rows to prevent row click from triggering when clicking on buttons or checkboxes within the row
- Make table actions (view, edit, delete) visually distinct with appropriate colors that match the app's theme
- Implement a "staged" approach to potentially destructive operations (like delete) with a confirmation dialog
- Export functionality should use the browser's native download capabilities via Blob and URL.createObjectURL()
- When implementing tables with selectable rows, maintain a separate array for selected items rather than modifying the original data

## Testing Strategies

- For component testing, ensure all event handlers are properly emitted and captured
- When testing table components, verify sorting, filtering, and pagination functionality independently
- Test user interactions (clicks, keyboard events) on all interactive elements
- Mock API responses with both success and error scenarios to ensure graceful error handling
- For export functionality, verify the correct format and content of exported data
- Test that confirmation dialogs appear for destructive operations and respect user choices
- Verify that styling is consistent across different states (loading, empty, error, populated)

## Database Field Handling Best Practices

- Empty strings should be handled with consistent parameterized queries instead of conditional SQL generation
- Parameter indexing in SQL queries must be maintained even when handling special cases
- For fields that need to accept empty strings, avoid conditional SQL like `fmpc = ''` and instead use parameterized queries
- When updating multiple fields, keep parameter indexing consistent to avoid off-by-one errors
- Use the correct connection string format: `postgresql://postgres:postgres@localhost:5432/postgres`
- Create setup scripts that verify database connection, schema, and core functionality
- Always test edge cases like empty strings, nulls, and special characters in database fields
- PostgreSQL treats empty strings and NULL values differently - be explicit about which one you want to use
- For debugging database issues, create targeted test scripts that isolate the specific functionality
- When using multiple services (main API, dedicated service), ensure consistent database handling across all services

## Patient Edit Functionality Fixes

- The PatientEdit component must explicitly handle both camelCase and snake_case properties (both `bloodType` and `blood_type`)
- When updating patient data, ensure critical fields like FMPC, blood type, and allergies are explicitly included in the update data
- For reliable updates, reflect server response data back to the UI component after successful update
- Add comprehensive logging of field values before and after save operations to diagnose update issues
- When working with form fields, ensure binding uses the correct property names that match the component's data model
- Use separate API test scripts to validate that backend updates are working correctly before debugging UI issues
- Test field refreshing on multiple fields to ensure all updates are properly reflected in the UI
- For consistent field handling, maintain both camelCase and snake_case versions of all fields throughout the application

## Add Patient Functionality Testing

- The Add Patient button is correctly implemented across the application with routes properly configured
- The route `/patients/add` reuses the PatientEdit component with an `isNew=true` prop to distinguish create vs edit mode
- The MCP server testing revealed the patient creation API works correctly and handles normalized fields appropriately
- Form submission properly normalizes data between camelCase and snake_case field names before sending to the API
- For UI testing, it's essential to try multiple port numbers (8080-8085) as Vite development servers create new ports when previous ones are in use
- Frontend screenshots are essential for debugging UI interactions during testing, especially for form submissions
- The patient creation API handles all required fields properly and returns the newly created patient with an assigned ID
- When testing Add Patient functionality, it's important to clean up test data by deleting created patients after verification
- Using consistent field naming conventions between frontend and backend prevents most patient creation issues
- The MCP environment properly handles all edge cases for patient record creation including special characters in fields

### MCP Server Integration Summary for Patient Create/Edit

- The MCP PostgreSQL server correctly stores and retrieves patient data with all fields properly preserved
- Successful integration testing requires a combination of API-level tests and UI interaction tests with Playwright
- When a patient is created through the UI, the database properly assigns an ID and all fields match what was submitted in the form
- Special fields like FMPC, blood type, and allergies are correctly handled by both the API and database
- The data flow from form submission through API to database and back works correctly across all fields
- Comprehensive logging in the server shows proper field normalization between camelCase and snake_case formats
- When form fields use snake_case (like `first_name`) but the API expects camelCase (like `firstName`), the preparePatientData function ensures compatibility
- Manual testing with visual browser validation provides the most comprehensive verification of the entire patient creation workflow 