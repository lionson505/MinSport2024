let inactivityTimeout;

const signOutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

const resetInactivityTimeout = () => {
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout);
  }
  inactivityTimeout = setTimeout(signOutUser, 15 * 60 * 1000); // 15 minutes
};

const setupInactivityHandler = () => {
  window.addEventListener('mousemove', resetInactivityTimeout);
  window.addEventListener('keydown', resetInactivityTimeout);
  window.addEventListener('scroll', resetInactivityTimeout);
  window.addEventListener('click', resetInactivityTimeout);

  resetInactivityTimeout(); // Initialize the timeout
};

export default setupInactivityHandler; 