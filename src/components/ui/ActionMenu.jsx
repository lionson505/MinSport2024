import React, { useState, useEffect } from 'react';
import { Pencil, Download, Trash2 } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { usePermissionLogger } from "../../utils/permissionLogger.js";

const ActionMenu = ({ onEdit, onDelete, onDownload }) => {
    const { isDarkMode } = useDarkMode();
    const [currentLocation, setCurrentLocation] = useState("");
    const [permissions, setPermissions] = useState({
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false
    });
    const fetchAndSetPermissions = async (moduleName)=> {
        const perms = await usePermissionLogger(moduleName)
        const currentPermissions = await perms()
        setPermissions(currentPermissions);

    };


    const getCurrentLocation = () => {
        const fullUrl = window.location.href;
        const urlSegments = fullUrl.split("/");
        const lastSegment = urlSegments[urlSegments.length - 1];
        setCurrentLocation(lastSegment);
        console.log("Current Location:", lastSegment);
    };


    useEffect(() => {
        getCurrentLocation();
    }, []);

    useEffect(() => {
        console.log("Current Location:", getCurrentLocation());
        if (currentLocation === "trainings") {
            fetchAndSetPermissions("trainings");
            

        } else if (currentLocation === "federations") {
            // const logPermissions = usePermissionLogger("federations");
            // const currentPermissions = logPermissions();
            // setPermissions(currentPermissions);
            fetchAndSetPermissions("FEDERATIONS");
        }
        else if (currentLocation === "partners") {
            fetchAndSetPermissions("partner");
    }

    }, [currentLocation]);

    // const logPermissions = usePermissionLogger('dashboard');
    console.log(permissions)

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