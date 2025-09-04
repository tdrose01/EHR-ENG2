# Device Management System Documentation

## Overview

The Device Management System provides comprehensive functionality for managing radiation monitoring devices in the EHR-ENG2 Radiation Health module. This system includes device inventory management, editing capabilities, and detailed readings visualization.

## Features

### Device Inventory Management
- **Device Listing**: View all active radiation monitoring devices
- **Device Information Display**: Shows device serial, model, firmware, calibration due date, RF policy, and reading count
- **Device Status Indicators**: Visual status indicators for device health and assignment status

### Device Editing
- **Create New Devices**: Add new radiation monitoring devices to the inventory
- **Edit Existing Devices**: Modify device properties and configuration
- **Device Model Selection**: Choose from available device models with vendor information
- **Form Validation**: Required field validation and data integrity checks
- **Unsaved Changes Warning**: Prevents accidental data loss when closing with unsaved changes

### Device Readings Viewer
- **Comprehensive Readings Display**: View all readings associated with a specific device
- **Advanced Filtering**: Filter readings by date range and personnel
- **Device Information Card**: Display device details including firmware, calibration due, RF policy, and total readings
- **Status Color Coding**: Visual indicators for dose rate safety levels (High/Medium/Normal)
- **Pagination**: Efficient handling of large datasets with paginated display
- **Real-time Data**: Live data fetching from the API

## Technical Implementation

### Components

#### DeviceEditModal.vue
**Purpose**: Modal component for device creation and editing

**Props**:
- `device`: Object - Device data for editing (null for new devices)
- `deviceModels`: Array - Available device models for selection
- `visible`: Boolean - Controls modal visibility

**Features**:
- Device model selection dropdown
- Serial number input (required)
- BLE MAC address input (optional)
- Firmware version input (optional)
- Calibration due date picker
- RF policy selection (required)
- Form validation and error handling
- Create/Update API integration

#### DeviceReadingsModal.vue
**Purpose**: Modal component for viewing device readings

**Props**:
- `device`: Object - Device data for readings display
- `personnel`: Array - Personnel data for filtering
- `visible`: Boolean - Controls modal visibility

**Features**:
- Device information display
- Date range filtering
- Personnel filtering
- Paginated readings table
- Status color coding
- Real-time data fetching

### API Integration

#### Device CRUD Operations
- **GET** `/api/radiation/devices` - Fetch all devices
- **POST** `/api/radiation/devices` - Create new device
- **PUT** `/api/radiation/devices/:id` - Update existing device
- **DELETE** `/api/radiation/devices/:id` - Delete device

#### Device Models
- **GET** `/api/radiation/device-models` - Fetch available device models

#### Device Readings
- **GET** `/api/radiation/readings?device_id=:id` - Fetch readings for specific device

### State Management

#### Modal State Variables
```javascript
const showDeviceEditModal = ref(false)
const showDeviceReadingsModal = ref(false)
const editingDevice = ref(null)
const deviceModels = ref([])
```

#### Modal Control Methods
```javascript
const openDeviceEditModal = (device = null)
const closeDeviceEditModal = ()
const openDeviceReadingsModal = (device)
const closeDeviceReadingsModal = ()
const onDeviceSaved = ()
const onDeviceError = (error)
const fetchDeviceModels = async ()
```

## User Interface

### Device Cards
Each device is displayed in a card format showing:
- Device serial number and model
- Firmware version
- Calibration due date
- RF policy
- Reading count
- Action buttons (Edit, Readings, Delete)

### Edit Modal
The device edit modal includes:
- Device model selection dropdown
- Serial number input field
- BLE MAC address input field
- Firmware version input field
- Calibration due date picker
- RF policy selection dropdown
- Action buttons (Cancel, Create/Update)

### Readings Modal
The device readings modal includes:
- Device information card
- Filter controls (date range, personnel)
- Readings table with pagination
- Status indicators
- Close button

## Usage Guide

### Editing a Device
1. Navigate to the Devices tab in the Radiation Health module
2. Click the "Edit" button on the desired device card
3. Modify the device properties in the edit modal
4. Click "Update Device" to save changes or "Cancel" to discard

### Creating a New Device
1. Navigate to the Devices tab in the Radiation Health module
2. Click the "Edit" button on any device card (this will open the edit modal)
3. Fill in the required fields (Device Model, Serial Number, RF Policy)
4. Optionally fill in additional fields (BLE MAC, Firmware, Calibration Due)
5. Click "Create Device" to save the new device

### Viewing Device Readings
1. Navigate to the Devices tab in the Radiation Health module
2. Click the "Readings" button on the desired device card
3. Use the filter controls to narrow down readings by date range or personnel
4. Browse through paginated results
5. Click "Close" to return to the device list

## Data Validation

### Required Fields
- Device Model
- Serial Number
- RF Policy

### Optional Fields
- BLE MAC Address
- Firmware Version
- Calibration Due Date

### Validation Rules
- Serial numbers must be unique
- Device models must exist in the system
- RF policy must be one of: CONTROLLED, UNCONTROLLED, RESTRICTED
- Calibration due date must be a valid date

## Error Handling

### Form Validation Errors
- Required field validation with visual indicators
- Duplicate serial number detection
- Invalid date format handling

### API Errors
- Network error handling with user feedback
- Server error handling with appropriate messages
- Loading states during API operations

### Modal State Management
- Proper modal visibility control
- Unsaved changes warning
- Clean state reset on modal close

## Security Considerations

### Data Access
- Device editing requires appropriate permissions
- Device readings are filtered by user access rights
- API endpoints are protected with authentication

### Data Integrity
- Form validation prevents invalid data entry
- Server-side validation ensures data consistency
- Audit trail for device modifications

## Troubleshooting

### Common Issues

#### Modal Not Opening
- Check that `showDeviceEditModal` or `showDeviceReadingsModal` is properly set to `true`
- Verify that the modal component is properly imported and registered

#### Device Models Not Loading
- Check that `fetchDeviceModels()` is called in `onMounted()`
- Verify API endpoint `/api/radiation/device-models` is accessible
- Check browser console for API errors

#### Form Validation Errors
- Ensure all required fields are filled
- Check that device model is selected from dropdown
- Verify serial number is unique
- Confirm RF policy is selected

#### Readings Not Displaying
- Verify device has readings in the database
- Check that device ID is properly passed to the readings modal
- Ensure API endpoint `/api/radiation/readings` is accessible

### Debug Information
- Check browser console for JavaScript errors
- Verify API responses in Network tab
- Check Vue DevTools for component state
- Review server logs for API errors

## Future Enhancements

### Planned Features
- Bulk device operations (import/export)
- Device calibration scheduling
- Advanced filtering and search capabilities
- Device assignment history tracking
- Automated calibration reminders
- Device performance analytics

### Technical Improvements
- Real-time device status updates
- Enhanced error reporting
- Improved mobile responsiveness
- Advanced data visualization
- Integration with external device management systems
