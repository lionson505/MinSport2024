// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import axiosInstance from '../utils/axiosInstance';
// import { Button } from '../components/ui/Button';
//
// // Permissions and Modules configuration
// export const MODULES = {
//   DASHBOARD: 'dashboard',
//   NATIONAL_TEAMS: 'national-teams',
//   FEDERATIONS: 'federations',
//   SPORTS_PROFESSIONALS: 'sports-professionals',
//   TRAININGS: 'trainings',
//   ISONGA_PROGRAMS: 'isonga-programs',
//   ACADEMIES: 'academies',
//   INFRASTRUCTURE: 'infrastructure',
//   SPORTS_TOURISM: 'sports-tourism',
//   DOCUMENTS: 'documents',
//   CONTRACTS: 'contracts',
//   APPOINTMENTS: 'appointments',
//   EMPLOYEE: 'employee',
//   USERS: 'users',
//   SPORTS_FOR_ALL: 'sports-for-all'
// };
//
// // Permission management functions
// const fetchPermissions = async (groupId) => {
//   try {
//     const response = await axiosInstance.get(`/api/permissions/groups/${groupId}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching permissions:', error);
//     return [];
//   }
// };
//
// const getStoredPermissions = () => {
//   try {
//     const perms = localStorage.getItem('permissions');
//     return perms ? JSON.parse(perms) : [];
//   } catch (error) {
//     console.error('Error getting stored permissions:', error);
//     return [];
//   }
// };
//
// const storePermissions = (permissions) => {
//   try {
//     localStorage.setItem('permissions', JSON.stringify(permissions));
//   } catch (error) {
//     console.error('Error storing permissions:', error);
//   }
// };
//
// export const hasPermission = (moduleName, action) => {
//   try {
//     if (localStorage.getItem('groupId') === '1') {
//       return true;
//     }
//
//     const permissions = getStoredPermissions();
//     const modulePermission = permissions.find(p => p.module?.name === moduleName);
//
//     if (!modulePermission) {
//       console.warn(`No permissions found for module: ${moduleName}`);
//       return false;
//     }
//
//     switch (action) {
//       case 'read':
//         return !!modulePermission.canRead;
//       case 'create':
//         return !!modulePermission.canCreate;
//       case 'update':
//         return !!modulePermission.canUpdate;
//       case 'delete':
//         return !!modulePermission.canDelete;
//       default:
//         console.warn(`Unknown action: ${action}`);
//         return false;
//     }
//   } catch (error) {
//     console.error('Error checking permission:', error);
//     return false;
//   }
// };
//
// const initializePermissions = async (groupId) => {
//   if (!groupId) return;
//   const permissions = await fetchPermissions(groupId);
//   if (permissions.length) {
//     storePermissions(permissions);
//   }
// };
//
// // Login Component
// const Login = () => {
//   const navigate = useNavigate();
//   const [isLoading, setIsLoading] = useState(false);
//   const [showOtpForm, setShowOtpForm] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [credentials, setCredentials] = useState({
//     email: '',
//     password: ''
//   });
//   const [otp, setOtp] = useState('');
//
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//
//     try {
//       const response = await axiosInstance.post('/auth/login', credentials);
//       setUserId(response.data.userId);
//       localStorage.setItem('tempUserId', response.data.userId);
//       setShowOtpForm(true);
//       toast.success('OTP sent to your email');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Login failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//
//     try {
//       const userId = localStorage.getItem('tempUserId');
//       const response = await axiosInstance.post('/auth/verify-otp', {
//         userId: String(userId),
//         otp: String(otp)
//       });
//
//       if (response.data.token && response.data.user) {
//         // Store user data
//         localStorage.removeItem('tempUserId');
//         localStorage.setItem('token', response.data.token);
//         localStorage.setItem('userRole', response.data.user.userGroup.name);
//         localStorage.setItem('userId', response.data.user.id);
//         localStorage.setItem('user', JSON.stringify(response.data.user));
//         localStorage.setItem('groupId', response.data.user.userGroup.id);
//         // localStorage.setItem('isActivated', response.data.user.userGroup.name === 'admin' ? 'true' : 'false');
//
//         if (rememberMe) {
//           localStorage.setItem('rememberMe', 'true');
//         } else {
//           localStorage.removeItem('rememberMe');
//         }
//
//         // Handle permissions for non-admin users
//         if (response.data.user.userGroup.name !== 'admin') {
//           const permissionsResponse = await axiosInstance.get(
//               `/permissions/groups/${response.data.user.userGroup.id}`
//           );
//
//           if (!permissionsResponse.data || permissionsResponse.data.length === 0) {
//             await initializePermissions(response.data.user.userGroup.id);
//             navigate('/pending-activation');
//             return;
//           }
//         }
//
//         // Initialize permissions and redirect
//         await initializePermissions(response.data.user.userGroup.id);
//         toast.success(response.data.message || 'Login successful');
//         navigate('/dashboard');
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'OTP verification failed');
//       setOtp('');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8">
//           <div>
//             <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//               {showOtpForm ? 'Enter OTP' : 'Sign in to your account'}
//             </h2>
//           </div>
//
//           {!showOtpForm ? (
//               <form onSubmit={handleLogin} className="mt-8 space-y-6">
//                 <input type="hidden" name="remember" value="true" />
//                 <div className="rounded-md shadow-sm space-y-4">
//                   <div>
//                     <label htmlFor="email" className="sr-only">Email address</label>
//                     <input
//                         id="email"
//                         name="email"
//                         type="email"
//                         required
//                         className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                         placeholder="Email address"
//                         value={credentials.email}
//                         onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="password" className="sr-only">Password</label>
//                     <input
//                         id="password"
//                         name="password"
//                         type="password"
//                         required
//                         className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                         placeholder="Password"
//                         value={credentials.password}
//                         onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
//                     />
//                   </div>
//                 </div>
//
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <input
//                         id="remember-me"
//                         name="remember-me"
//                         type="checkbox"
//                         className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//                         checked={rememberMe}
//                         onChange={(e) => setRememberMe(e.target.checked)}
//                     />
//                     <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
//                       Remember me
//                     </label>
//                   </div>
//                 </div>
//
//                 <div>
//                   <Button
//                       type="submit"
//                       disabled={isLoading}
//                       className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                   >
//                     {isLoading ? 'Signing in...' : 'Sign in'}
//                   </Button>
//                 </div>
//               </form>
//           ) : (
//               <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
//                 <div className="rounded-md shadow-sm -space-y-px">
//                   <div>
//                     <label htmlFor="otp" className="sr-only">OTP</label>
//                     <input
//                         id="otp"
//                         name="otp"
//                         type="text"
//                         required
//                         className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//                         placeholder="Enter OTP"
//                         value={otp}
//                         onChange={(e) => setOtp(e.target.value)}
//                     />
//                   </div>
//                 </div>
//
//                 <div>
//                   <Button
//                       type="submit"
//                       disabled={isLoading}
//                       className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                   >
//                     {isLoading ? 'Verifying...' : 'Verify OTP'}
//                   </Button>
//                 </div>
//               </form>
//           )}
//         </div>
//       </div>
//   );
// };
//
// export default Login;