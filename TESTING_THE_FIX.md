# Testing Document: Microservices Troubleshooting and Documentation Update

## 1. Objective

The purpose of this document is to provide a clear set of steps to test and verify the outcome of the recent microservices troubleshooting session. The tests will confirm that all services were checked, the documentation was updated correctly, and the lessons learned were recorded.

## 2. Prerequisites

- Access to the `EHR-ENG2` project directory.
- A code editor or text viewer to inspect Markdown files.
- A terminal or command prompt to run `pytest`.

## 3. Test Cases

### Test Case 1: Verify Microservice Health

**Objective:** Manually re-run tests for a few key microservices to validate the troubleshooting findings.

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1.1 | Open a terminal in the project root directory. | The terminal is ready for commands. |
| 1.2 | Run the tests for the `anomaly_detection_service` by executing:<br>`pytest server/anomaly_detection_service/` | The tests should run and pass without errors. |
| 1.3 | Run the tests for the `data_retention_service` by executing:<br>`pytest server/data_retention_service/` | The tests should run and pass without errors. |
| 1.4 | Run the tests for the `grpc_service` using the module-aware command:<br>`python -m pytest server/grpc_service/` | The tests should run and pass without errors, confirming the pathing issue workaround. |

### Test Case 2: Verify Documentation Updates

**Objective:** Confirm that the `README.md` and the newly created `LESSONS_UPDATED.md` and `TROUBLESHOOTING_FIXED.md` files contain the correct information.

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 2.1 | Open the `README.md` file. | The file opens successfully. |
| 2.2 | Navigate to the "Environmental Exposure Tracking Backend" section. | A new subsection titled "**Microservices Health Check (July 2025)**" should be present, detailing the outcome of the troubleshooting. |
| 2.3 | Open the `TROUBLESHOOTING_FIXED.md` file. | The file should exist and contain a checklist where all eight microservices are marked with `[x]`. |
| 2.4 | Open the `LESSONS_UPDATED.md` file. | The file should exist. |
| 2.5 | Scroll to the bottom of `LESSONS_UPDATED.md`. | A new section titled "**Lesson: Microservices Troubleshooting (July 2025)**" should be present, documenting the file permission and Python testing environment issues. |

### Test Case 3: Verify File Integrity

**Objective:** Ensure that the original `TROUBLESHOOTING.md` and `LESSONS.md` files were not altered due to the permission errors.

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 3.1 | Open the original `TROUBLESHOOTING.md` file. | The file should be unchanged, with all items still marked with `[ ]`. |
| 3.2 | Open the original `LESSONS.md` file. | The file should be unchanged, without the new "Microservices Troubleshooting" section at the end. |

## 4. Summary

If all test cases pass, it confirms that:
- The microservices are in a healthy state as reported.
- The documentation accurately reflects the work completed.
- The workarounds for the file permission issues were successful and have been documented.
