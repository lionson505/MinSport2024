/* src/pages/SportsTourism.jsx */
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {Loader2, Plus} from 'lucide-react';
import { Button } from '../components/ui/Button';
import TourismEventsList from '../components/tourism/TourismEventsList';
import TourismCalendar from '../components/tourism/TourismCalendar';
import AddEventModal from '../components/tourism/AddEventModal';
import { useDarkMode } from '../contexts/DarkModeContext';
import CategoryManagementModal from '../components/tourism/CategoryManagementModal';
import axiosInstance from '../utils/axiosInstance';
import { usePermissionLogger } from '../utils/permissionLogger.js';

const SportsTourism = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const logPermissions = usePermissionLogger('sports_tourism')
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })
  const [events, setEvents] = useState([]);
  // console.log('events:', events)
  const fetchPermissions = async ()=> {
    const currentPermissions =await logPermissions();
    await setPermissions(currentPermissions);
    setLoading(false);
  }
  useEffect(() => {
    fetchPermissions();
    // Fetch events data using axiosInstance
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get('/sports-tourism-events');
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  if(loading){
    return <div className="flex animate-spin animate justify-center items-center h-screen">
      <Loader2 />

    </div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Sports Tourism Events
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage and monitor sports tourism events across the country
          </p>
        </div>
        <div className="flex gap-3">
          {permissions.canUpdate && (<Button
              variant="outline"
              onClick={() => setShowCategoryModal(true)}
          >
            Manage Categories
          </Button>)}
          {permissions.canCreate && (<Button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Event
          </Button>)}

        </div>
      </div>

      <Tabs defaultValue="list" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <TourismEventsList events={events} />
        </TabsContent>

        <TabsContent value="calendar">
          <TourismCalendar events={events} />
        </TabsContent>
      </Tabs>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Category Management Modal */}
      <CategoryManagementModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />
    </div>
  );
};

export default SportsTourism;
