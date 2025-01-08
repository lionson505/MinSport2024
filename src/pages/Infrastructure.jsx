import React, { useState, useEffect } from 'react';
import {Loader2, Plus} from 'lucide-react';
import { Button } from '../components/ui/Button';
import InfrastructureMap from '../components/infrastructure/InfrastructureMap';
import InfrastructureList from '../components/infrastructure/InfrastructureList';
import AddInfrastructureModal from '../components/infrastructure/AddInfrastructureModal';
import BookingManagement from '../components/infrastructure/BookingManagement';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useDarkMode } from '../contexts/DarkModeContext';
import CategoryManagementModal from '../components/infrastructure/CategoryManagementModal';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import { usePermissionLogger } from '../utils/permissionLogger.js';

const Infrastructure = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const { isDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [infrastructure, setInfrastructure] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const logPermissions = usePermissionLogger('infrastructure')
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })



  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/infrastructure-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };




  const fetchInfrastructure = async () => {
    try {
      const response = await axiosInstance.get('/infrastructures');
      setInfrastructure(response.data);
    } catch (error) {
      console.error('Error fetching infrastructure:', error);
      toast.error('Failed to fetch infrastructure data');
    }
  };

  const updateCategories = async (updatedCategories) => {
    try {
      await axiosInstance.put('/infrastructure-categories', updatedCategories);
      setCategories(updatedCategories);
      setLastUpdate(Date.now());
      toast.success('Categories updated successfully');
    } catch (error) {
      console.error('Error updating categories:', error);
      toast.error('Failed to update categories');
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      await setLoading(true);
      await fetchCategories();
      await fetchInfrastructure();
      const currentPermissions = await logPermissions();
      await  setPermissions(currentPermissions);
      await setLoading(false);
    };

    fetchData();
  }, [lastUpdate]);

  const refreshData = async () => {
    try {
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    }
  };
  if(loading) {
    return(
        <div className="flex animate-spin animate justify-center items-center h-screen">
          <Loader2/>
        </div>
    )

  }

  const showAddButton = activeTab === 'list';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Sports Infrastructure
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage and monitor sports facilities across the country
          </p>
        </div>
        <div className="flex gap-3">
          {showAddButton && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowCategoryModal(true)}
              >
                Manage Categories
              </Button>
              {permissions.canCreate && (
                  <Button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Infrastructure
                  </Button>
              )}

            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="list" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">
            List View
          </TabsTrigger>
          <TabsTrigger value="map">
            Map View
          </TabsTrigger>
          <TabsTrigger value="bookings">
            Booking Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <InfrastructureList infrastructure={infrastructure} />
        </TabsContent>

        <TabsContent value="map">
          <InfrastructureMap infrastructure={infrastructure} />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingManagement />
        </TabsContent>
      </Tabs>

      <AddInfrastructureModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onRefresh={refreshData}
      />

      <CategoryManagementModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        onUpdate={updateCategories}
      />
    </div>
  );
};

export default Infrastructure;
