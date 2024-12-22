import axiosInstance from '../utils/axiosInstance';
import { toast } from 'sonner';

export const groupService = {
  // Fetch all modules
  getModules: async () => {
    try {
      const response = await axiosInstance.get('/modules');
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error.response || error);
      throw new Error('Failed to fetch modules');
    }
  },

  // Get all groups
  getGroups: async () => {
    try {
      const response = await axiosInstance.get('/groups');
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error.response || error);
      throw new Error('Failed to fetch groups');
    }
  },

  // Create new group with permissions
  createGroup: async (groupData) => {
    try {
      // Format the data to exactly match the working Swagger example
      const formattedData = {
        name: groupData.name,
        description: groupData.description || '',
        isDefault: false,
        permissions: groupData.permissions
          .filter(p => p.canRead || p.canCreate || p.canUpdate || p.canDelete)
          .map(permission => {
            const perm = {
              moduleId: Number(permission.moduleId)
            };
            
            // Only include the permissions that are true
            // Don't include false values at all
            if (permission.canRead) perm.canRead = true;
            if (permission.canCreate) perm.canCreate = true;
            if (permission.canUpdate) perm.canUpdate = true;
            if (permission.canDelete) perm.canDelete = true;
            
            return perm;
          })
      };

      // If no permissions, use a minimal default permission
      if (formattedData.permissions.length === 0) {
        formattedData.permissions = [{
          moduleId: 1,
          canRead: true
        }];
      }

      // Debug logs
      console.log('Request URL:', `${axiosInstance.defaults.baseURL}/groups`);
      console.log('Request Payload:', JSON.stringify(formattedData, null, 2));

      // Try with explicit headers
      const response = await axiosInstance.post('/groups', formattedData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Group Creation Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      // More specific error messages
      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later or contact support.');
      } else if (error.response?.status === 401) {
        throw new Error('Your session has expired. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to create groups.');
      }

      throw new Error(error.response?.data?.error || 'Failed to create group');
    }
  },

  // Update existing group
  updateGroup: async (groupId, groupData) => {
    try {
      const formattedData = {
        name: groupData.name,
        description: groupData.description,
        permissions: groupData.permissions.map(permission => ({
          moduleId: permission.moduleId,
          canRead: permission.canRead || false,
          canCreate: permission.canCreate || false,
          canUpdate: permission.canUpdate || false,
          canDelete: permission.canDelete || false
        }))
      };

      const response = await axiosInstance.put(`/groups/${groupId}`, formattedData);
      return response.data;
    } catch (error) {
      console.error('Error updating group:', error.response || error);
      const errorMessage = error.response?.data?.message || 'Failed to update group';
      throw new Error(errorMessage);
    }
  },

  // Add this test function
  testGroupCreation: async () => {
    try {
      // Test payload matching the working curl command
      const testPayload = {
        name: "string",
        description: "string",
        isDefault: false,
        permissions: [
          {
            moduleId: 0,
            canRead: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false
          }
        ]
      };

      console.log('Testing group creation with payload:', JSON.stringify(testPayload, null, 2));
      
      const response = await axiosInstance.post('/groups', testPayload);
      console.log('Test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Test Error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    }
  }
}; 