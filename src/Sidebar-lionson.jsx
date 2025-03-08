// import React, { useState, useEffect } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import { useDarkMode } from "../contexts/DarkModeContext";
// import axiosInstance from "../utils/axiosInstance";
// import {
//   LayoutGrid,
//   Flag,
//   Award,
//   // Users,
//   GraduationCap,
//   School,
//   Building2,
//   Plane,
//   FileText,
//   Briefcase,
//   Calendar,
//   CircleUser,
//   UsersRound,
//   BarChart3,
//   Trophy,
//   Settings,
//   Moon,
//   Sun,
//   Search,
//   Bell,
//   Menu,
//   X,
//   UserPlus,
//   Timer,
// } from "lucide-react";
//
// const sidebarLinks = [
// { title: "Dashboard", icon: LayoutGrid, label: "Dashboard", path: "/dashboard" },
// { title: "National Teams", path: "/national-teams", icon: Flag },
// { title: "Federations", icon: Award, label: "Federations", path: "/federations" },
// { title: "Sports professionals", icon: Users, label: "Sports professionals", path: "/sports-professionals" },
// { title: "Trainings", icon: GraduationCap, label: "Trainings", path: "/trainings" },
// { title: "Isonga Programs", icon: School, label: "Isonga Programs", path: "/isonga-programs" },
// { title: "Academies", icon: School, label: "Academies", path: "/academies" },
// { title: "Infrastructure", icon: Building2, label: "Infrastructure", path: "/infrastructure" },
// { title: "Sports tourism", icon: Plane, label: "Sports tourism", path: "/sports-tourism" },
// { title: "Documents", icon: FileText, label: "Documents", path: "/documents" },
// { title: "Contracts", icon: Briefcase, label: "Contracts", path: "/contracts" },
// { title: "Appointments", icon: Calendar, label: "Appointments", path: "/appointments" },
// { title: "Employee", icon: CircleUser, label: "Employee", path: "/employee" },
// { title: "Users", icon: UsersRound, label: "Users", path: "/users" },
// { title: "Partners", icon: Users, label: "Partners", path: "/partners" },
// { title: "Reports", icon: BarChart3, label: "Reports", path: "/reports" },
// { title: "Sports for all", icon: Trophy, label: "Sports for all", path: "/sports-for-all" },
// { title: "Transfer Report", icon: UserPlus, label: "Transfer Report", path: "/player-transfer-report" },
// { title: "Match Operator", icon: Timer, label: "Match Operator", path: "/match-operator" },
// ];
//
// const Sidebar = () => {
//   const { isDarkMode, toggleDarkMode } = useDarkMode();
//   const [isCollapsed, setIsCollapsed] = useState(false);
//   const location = useLocation();
//   const [accessibleModules, setAccessibleModules] = useState([]);
//   const [accessibleLinks, setAccessibleLinks] = useState([]);
//
//   useEffect(() => {
//     const fetchGroupDetails = async () => {
//       try {
//         const userRole = await localStorage.getItem("userRole");
//         const response = await axiosInstance.get(`/groups/${userRole}`);
//         const modules = response.data.accessibleModules;
//
//         if (modules === "all") {
//           setAccessibleModules(sidebarLinks.map((link) => link.path)); // All modules accessible
//         } else if (modules) {
//           const formattedModules = modules.split(", ").map((module) =>
//               module.trim().toLowerCase().replace(/_/g, "-")
//           );
//           setAccessibleModules(formattedModules);
//         } else {
//           setAccessibleModules([]); // No modules accessible
//         }
//       } catch (error) {
//         console.error("Error fetching group details:", error);
//         setAccessibleModules([]); // Handle error gracefully
//       }
//     };
//
//     fetchGroupDetails();
//   }, []);
//
//   useEffect(() => {
//     const links = sidebarLinks.filter((link) =>
//         accessibleModules.some((module) => link.path.toLowerCase().includes(module))
//     );
//
//     const dashboardLink = sidebarLinks.find((link) => link.path === "/dashboard");
//     if (dashboardLink && !links.some((link) => link.path === "/dashboard")) {
//       links.unshift(dashboardLink); // Ensure Dashboard is always accessible
//     }
//
//     setAccessibleLinks(links);
//     localStorage.setItem("accessibleLinks", JSON.stringify(links));
//   }, [accessibleModules]);
//
//   return (
//       <aside
//           className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
//               isCollapsed ? "-translate-x-full" : "translate-x-0"
//           } md:relative md:translate-x-0 ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
//           style={{ width: isCollapsed ? "64px" : "256px" }}
//       >
//         <div
//             className={`flex flex-col h-full ${
//                 isDarkMode ? "border-gray-700" : "border-gray-200"
//             } border-r`}
//         >
//           {/* Logo */}
//           {/* <NavLink
//             to={"/"}
//
//           >
//           <div
//               className={`flex items-center justify-center h-16 px-4 ${
//                   isDarkMode ? "border-gray-700" : "border-gray-200"
//               } border-b`}
//           >
//
//             <img src="/logo/logo.svg" alt="Logo" className="h-10 w-auto" />
//
//           </div>
//           </NavLink> */}
//
//           {/* Navigation */}
//           <div className="flex-1 overflow-y-auto">
//             <nav className="px-3 py-4 space-y-1">
//               {accessibleLinks.map((item) => {
//                 const isActive = location.pathname === item.path;
//                 return (
//                     <NavLink
//                         key={item.title}
//                         to={item.path}
//                         className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
//                             isActive
//                                 ? "bg-blue-600 text-white"
//                                 : isDarkMode
//                                     ? "text-gray-300 hover:bg-gray-800"
//                                     : "text-gray-600 hover:bg-gray-100"
//                         }`}
//                     >
//                       <item.icon className="h-5 w-5" />
//                       <span className="text-sm">{item.title}</span>
//                     </NavLink>
//                 );
//               })}
//             </nav>
//           </div>
//
//           {/* Settings */}
//           {/* <div
//               className={`p-4 ${
//                   isDarkMode ? "border-gray-700" : "border-gray-200"
//               } border-t`}
//           >
//             <button
//                 onClick={toggleDarkMode}
//                 className={`flex items-center space-x-3 px-4 py-2.5 w-full rounded-lg ${
//                     isDarkMode
//                         ? "text-gray-300 hover:bg-gray-800"
//                         : "text-gray-600 hover:bg-gray-100"
//                 }`}
//             >
//               {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
//               <span className="text-sm TEXT-BLACK">Toggle Dark Mode</span>
//             </button>
//           </div> */}
//         </div>
//       </aside>
//   );
// };
//
// export default Sidebar;
//
