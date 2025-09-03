# Unit Management System Documentation

## Overview

The Unit Management System is a comprehensive organizational hierarchy management solution integrated into the Radiation Health (RH) module. It provides complete CRUD operations for managing military organizational units with UIC (Unit Identification Code) support, hierarchical relationships, and personnel assignment tracking.

## Features

### Core Functionality
- **Unit Creation**: Create new organizational units with UIC codes and names
- **Unit Editing**: Update unit information including name and parent relationships
- **Unit Deletion**: Remove units with safety checks for dependencies
- **Hierarchical Management**: Establish parent-child relationships between units
- **Personnel Assignment**: Track personnel assigned to each unit
- **Visual Hierarchy**: Tree-like visualization of unit relationships

### User Interface
- **Units Tab**: Dedicated tab in the Radiation Dashboard
- **Unit Table**: Comprehensive table view with all unit information
- **Hierarchy Visualization**: Interactive tree structure showing unit relationships
- **Modal Forms**: User-friendly forms for creating and editing units
- **Action Buttons**: Quick access to edit, view personnel, and delete operations

## Technical Implementation

### Frontend Components

#### UnitManagementModal.vue
- **Purpose**: Modal component for creating and editing units
- **Features**:
  - Form validation for UIC codes and unit names
  - Parent unit selection with hierarchy preview
  - Real-time hierarchy visualization
  - Error handling and loading states
  - Prevents circular references and invalid hierarchies

#### UnitHierarchyNode.vue
- **Purpose**: Recursive component for visualizing unit hierarchy
- **Features**:
  - Tree-like structure display
  - Personnel count for each unit
  - Edit and view personnel actions
  - Visual hierarchy indicators with connecting lines

### Backend API

#### Endpoints
- `GET /api/radiation/units` - Retrieve all units with complete information
- `POST /api/radiation/units` - Create new unit
- `PUT /api/radiation/units/:id` - Update existing unit
- `DELETE /api/radiation/units/:id` - Delete unit with safety checks

#### Database Schema
```sql
CREATE TABLE radiation_units (
  id SERIAL PRIMARY KEY,
  uic VARCHAR(20) NOT NULL UNIQUE,  -- UIC code
  name TEXT NOT NULL,
  parent_uic VARCHAR(20),           -- Parent unit UIC
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Safety Features

#### Deletion Protection
- **Child Unit Check**: Prevents deletion of units with child units
- **Personnel Assignment Check**: Prevents deletion of units with assigned personnel
- **Confirmation Dialogs**: User confirmation required for destructive operations

#### Data Validation
- **UIC Uniqueness**: Ensures UIC codes are unique across the system
- **Hierarchy Validation**: Prevents circular references in unit hierarchy
- **Required Fields**: Validates that essential fields are provided

## Usage Guide

### Creating a Unit
1. Navigate to the Radiation Dashboard
2. Click on the "Units" tab
3. Click "Add Unit" button
4. Fill in the required information:
   - UIC Code (unique identifier)
   - Unit Name
   - Parent Unit (optional)
5. Review the hierarchy preview
6. Click "Create Unit"

### Editing a Unit
1. In the Units tab, click the edit icon for the desired unit
2. Modify the unit information
3. Review the hierarchy preview
4. Click "Update Unit"

### Viewing Unit Personnel
1. In the Units tab, click the personnel icon for the desired unit
2. The system will filter the Personnel tab to show only personnel from that unit

### Deleting a Unit
1. In the Units tab, click the delete icon for the desired unit
2. Confirm the deletion in the dialog
3. The system will check for dependencies and prevent deletion if unsafe

### Viewing Unit Hierarchy
- The hierarchy visualization is automatically displayed below the units table
- Shows the complete organizational structure with personnel counts
- Interactive elements allow quick access to unit actions

## Integration Points

### Personnel Management
- Units are linked to personnel through the `unit_id` field
- Personnel can be filtered by unit in the Personnel tab
- Unit personnel counts are displayed in the hierarchy

### Device Management
- Units can be associated with device assignments
- Provides organizational context for device deployment

### Reporting and Analytics
- Unit-based reporting capabilities
- Personnel distribution analysis
- Organizational structure reporting

## Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string for unit data storage

### Database Permissions
- Admin users have full CRUD access to units
- Regular users can view unit information
- Personnel assignment requires appropriate permissions

## Troubleshooting

### Common Issues

#### "Cannot delete unit with child units"
- **Cause**: Attempting to delete a unit that has child units
- **Solution**: Delete or reassign child units first

#### "Cannot delete unit with assigned personnel"
- **Cause**: Attempting to delete a unit with assigned personnel
- **Solution**: Reassign personnel to other units first

#### "UIC code already exists"
- **Cause**: Attempting to create a unit with an existing UIC code
- **Solution**: Use a different UIC code

### Performance Considerations
- Unit hierarchy queries are optimized for large organizational structures
- Personnel count calculations are cached for better performance
- Database indexes on UIC codes ensure fast lookups

## Future Enhancements

### Planned Features
- **Unit Templates**: Predefined unit structures for common military organizations
- **Bulk Operations**: Import/export unit hierarchies
- **Advanced Reporting**: Detailed unit-based analytics and reporting
- **Audit Trail**: Complete history of unit changes and modifications
- **Role-Based Access**: Granular permissions for unit management operations

### Integration Opportunities
- **External Systems**: Integration with military personnel systems
- **Reporting Tools**: Enhanced reporting and analytics capabilities
- **Mobile Support**: Mobile-optimized unit management interface

## Support

For technical support or feature requests related to the Unit Management System, please refer to the main project documentation or contact the development team.

---

**Last Updated**: September 3, 2025  
**Version**: 2.1.0  
**Status**: Production Ready ✅
