import React, { useState, useEffect } from 'react';
import { Pencil, Download, Trash2 } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { usePermissionLogger } from "../../utils/permissionLogger.js";


const ActionMenu = ({ onEdit, onDelete, onDownload }) => {
    const { isDarkMode } = useDarkMode();
    const [loading, setIsLoading] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(true);
    const [permissions, setPermissions] = useState({
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false
    });
    const fetchAndSetPermissions = async (moduleName)=> {
        const perms = usePermissionLogger(moduleName)
        const currentPermissions =await perms();
         await setPermissions(currentPermissions);
         setIsLoading(false);
        
        
    };


    const getCurrentLocation = () => {
        const fullUrl = window.location.href;
        const urlSegments = fullUrl.split("/");
        const lastSegment = urlSegments[urlSegments.length - 1];
        setCurrentLocation(lastSegment);
        // console.log("Current Location:", lastSegment);
    };


    useEffect(() => {
        getCurrentLocation();
    }, []);

    useEffect(() => {
        if (currentLocation === "trainings") {
            fetchAndSetPermissions("trainings");
            

        } else if (currentLocation === "federations") {
            // const logPermissions = usePermissionLogger("federations");
            // const currentPermissions = logPermissions();
            // setPermissions(currentPermissions);
            fetchAndSetPermissions("federations");
        }
        else if (currentLocation === "partners") {
            fetchAndSetPermissions("partner");
    }

    }, [currentLocation]);

    if(loading) {
        return(
            <div className="flex animate-spin animate justify-center items-center h-screen">
              <Loader2/>
            </div>
        )
    
      }

    return (
        <div className="flex items-center gap-2">
            {permissions.canUpdate && (
                <button
                    onClick={onEdit}
                    className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode
                            ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }`}
                    title="Edit"
                >
                    <Pencil className="h-4 w-4" />
                </button>
            )}

            <button
                onClick={onDownload}
                className={`p-1.5 rounded-lg transition-colors ${
                    isDarkMode
                        ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
                title="Download"
            >
                <Download className="h-4 w-4" />
            </button>

            {permissions.canDelete && (
                <button
                    onClick={onDelete}
                    className={`p-1.5 rounded-lg transition-colors ${
                        isDarkMode
                            ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300'
                            : 'hover:bg-red-50 text-red-600 hover:text-red-700'
                    }`}
                    title="Delete"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export default ActionMenu;