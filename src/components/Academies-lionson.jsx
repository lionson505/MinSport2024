const handleEditStudentSubmit = async (data) => {
  try {
    // console.log('Sending data to API:', data); 
    const response = await axios.put(
      `${API_BASE_URL}/api/academy-students/${data.id}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (response.data) {
      toast.success('Student updated successfully');
      // Refresh your data here
    }
  } catch (error) {
    console.error('Error updating student:', error.response?.data || error);
    throw error;
  }
};