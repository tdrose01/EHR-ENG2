# Manual Entry System Documentation

## Overview

The Manual Entry System allows users to manually input radiation dose readings when Bluetooth devices are unavailable or when manual data entry is required. This system provides a complete workflow from data entry to display in the radiation dashboard.

## Features

### ✅ **Core Functionality**
- **Manual Dose Reading Entry**: Complete form for entering dose readings manually
- **Immediate Display**: Manual entries appear instantly in the radiation dashboard
- **Data Validation**: Proper formatting and validation of dose values
- **Visual Distinction**: Manual entries are clearly marked with green styling and "Manual" labels

### ✅ **Data Fields**
- **HP(10) mSv**: Deep dose equivalent (whole body)
- **HP(0.07) mSv**: Shallow dose equivalent (skin)
- **Rate µSv/h**: Dose rate measurement
- **Device Selection**: Choose from available radiation devices
- **Timestamp**: Automatic timestamp generation
- **Notes**: Optional notes field for additional information

### ✅ **User Experience**
- **Success Alerts**: Confirmation when entries are successfully submitted
- **Form Validation**: Required field validation with visual indicators
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme Support**: Consistent with application theme

## Technical Implementation

### **Frontend Components**
- **`ManualDoseReadingForm.vue`**: Main form component for manual entry
- **`RadiationDashboard.vue`**: Dashboard displaying manual entries with visual indicators

### **Backend API**
- **`POST /api/radiation/ingest/readings`**: Endpoint for submitting manual entries
- **`GET /api/radiation/readings`**: Endpoint for fetching all readings including manual entries

### **Database Schema**
- **`radiation_dose_readings`**: Table storing all dose readings
- **Columns**: `hp10_mSv`, `hp007_mSv`, `rate_uSv_h`, `data_source`, `entered_by`

## Data Flow

```
1. User opens manual entry form
2. User fills in dose values and selects device
3. Form validates data and submits to API
4. API stores data in database with 'manual' data_source
5. Dashboard refreshes and displays new entry
6. Manual entry appears with green styling and "Manual" label
```

## Visual Indicators

### **Manual Entry Styling**
- **Background**: Light green background (`bg-green-50 dark:bg-green-900/20`)
- **Border**: Green border (`border-green-200 dark:border-green-800`)
- **Label**: "Manual" badge with green styling
- **Personnel**: "No personnel assigned" message for manual entries

### **Data Display**
- **Dose Values**: Properly formatted with 6 decimal places for doses, 2 for rates
- **Timestamps**: Formatted date/time display
- **Device Info**: Device serial and model information
- **Status**: Clear indication of manual vs automated entries

## Error Handling

### **Form Validation**
- Required field validation
- Numeric value validation for dose fields
- Device selection validation

### **API Error Handling**
- Network error handling
- Server error responses
- User-friendly error messages

### **Data Integrity**
- Case sensitivity handling for database columns
- Proper data type conversion
- Duplicate entry prevention

## Usage Instructions

### **Accessing Manual Entry**
1. Navigate to the Radiation Health dashboard
2. Click the "Manual Entry" button
3. Fill in the required dose values
4. Select a device from the dropdown
5. Add optional notes
6. Click "Submit Reading"

### **Viewing Manual Entries**
1. Manual entries appear in the main readings table
2. Look for green-styled rows with "Manual" labels
3. Manual entries show "No personnel assigned" in the personnel column
4. All dose values display correctly formatted

## Troubleshooting

### **Common Issues**
- **"N/A" values**: Fixed in v2.2.1 - case sensitivity issue resolved
- **Duplicate entries**: Prevented with deduplication logic
- **Form not submitting**: Check required fields and device selection

### **Debug Information**
- Console logs available for debugging (removed in production)
- Network tab shows API requests/responses
- Database queries logged in server console

## Recent Fixes (v2.2.1)

### **Issue**: Manual entries showing "N/A" for dose values
**Root Cause**: Case sensitivity mismatch between database column names and frontend expectations
**Solution**: 
- Updated SQL query to use explicit column aliases
- Fixed data flow from API to frontend
- Added proper case sensitivity handling

### **Issue**: Duplicate key warnings in Vue
**Root Cause**: Multiple JOINs creating duplicate entries
**Solution**:
- Added `DISTINCT ON (dr.id)` to SQL query
- Implemented client-side deduplication
- Enhanced `v-for` keys for uniqueness

## Future Enhancements

### **Planned Features**
- **Bulk Entry**: Multiple entries at once
- **Template System**: Predefined entry templates
- **Offline Support**: Local storage for offline entries
- **Export Functionality**: Export manual entries to CSV/PDF
- **Audit Trail**: Detailed logging of manual entries

### **Performance Improvements**
- **Lazy Loading**: Load manual entries on demand
- **Caching**: Cache frequently accessed data
- **Optimization**: Reduce API calls and improve response times
