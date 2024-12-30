import React from 'react';
import { Box, Typography } from '@mui/material';
import { PermissionButton } from '../components/PermissionButton';
import { withPermission } from '../components/withPermission';
import { MODULES } from '../utils/rbac';

const UsersPage = () => {
  const handleCreate = () => {
    // Your create handler
  };

  const handleEdit = (id: number) => {
    // Your edit handler
  };

  const handleDelete = (id: number) => {
    // Your delete handler
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Users Management</Typography>
        
        <PermissionButton 
          moduleName={MODULES.USERS}
          action="create"
          variant="contained"
          color="primary"
          onClick={handleCreate}
        >
          Add New User
        </PermissionButton>
      </Box>

      {/* Your table component */}
      <Box>
        {/* Example table row actions */}
        <PermissionButton 
          moduleName={MODULES.USERS}
          action="update"
          size="small"
          onClick={() => handleEdit(1)}
        >
          Edit
        </PermissionButton>
        
        <PermissionButton 
          moduleName={MODULES.USERS}
          action="delete"
          size="small"
          color="error"
          onClick={() => handleDelete(1)}
        >
          Delete
        </PermissionButton>
      </Box>
    </Box>
  );
};

export default withPermission(UsersPage, MODULES.USERS); 