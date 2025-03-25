import React, { useState, useEffect } from 'react';

function useAuth() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const initializeAuth = async () => {
    try {
      // Assuming there's a function to fetch user data
      const userData = await fetchUserData();
      if (!userData || !userData.id) {
        throw new Error('User ID not found.');
      }
      setUser(userData);
    } catch (err) {
      console.error('Error initializing user:', err);
      setError(err);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  return { user, error };
}

export default useAuth; 