import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getSportsEvents, addSportsEvent, deleteSportsEvent } from '../services/sportall';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import AddMassSportModal from '../components/AddMassSportModal';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { AlertCircle, Edit, Download, Trash2, AlertTriangle, Eye, X} from 'lucide-react';

function SportsForAll() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // Delete modal state
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [massSportsData, setMassSportsData] = useState([]);
  const [sportToEdit, setSportToEdit] = useState(null); // For editing
  const [sportToDelete, setSportToDelete] = useState(null); // For deleting
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchSportsData = async () => {
      try {
        setLoading(true);
        const data = await getSportsEvents();
        setMassSportsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSportsData();
  }, []);

  const handleAddOrUpdateSport = async (sport) => {
    try {
      setLoading(true);

      if (sportToEdit) {
        // Update existing sport
        const updatedData = massSportsData.map((item) =>
          item.id === sportToEdit.id ? { ...item, ...sport } : item
        );
        setMassSportsData(updatedData);
        toast.success('Sport updated successfully!');
      } else {
        // Add new sport
        const addedSport = await addSportsEvent(sport);
        setMassSportsData((prev) => [...prev, addedSport]);
        toast.success('Sport added successfully!');
      }

      setIsAddModalOpen(false);
      setSportToEdit(null); // Clear edit state
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSport = (id) => {
    const sport = massSportsData.find((sport) => sport.id === id);
    setSportToDelete(sport); // Set the sport to delete
    setDeleteModalOpen(true); // Open the delete modal
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await deleteSportsEvent(sportToDelete.id);
      setMassSportsData((prev) => prev.filter((sport) => sport.id !== sportToDelete.id));
      toast.success('Sport deleted successfully!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteModalOpen(false);
      setSportToDelete(null); // Clear delete state
      setLoading(false);
    }
  };

  const filteredData = massSportsData.filter((sport) =>
    Object.values(sport).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Manage Mass Sports</h1>
      <div className="flex justify-between items-center mb-6">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
          placeholder="Search..."
        />
        <Button
          onClick={() => {
            setSportToEdit(null); // Reset edit state for new entry
            setIsAddModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add Mass Sport
        </Button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Province</th>
            <th className="px-4 py-2 text-left">District</th>
            <th className="px-4 py-2 text-left">Sector</th>
            <th className="px-4 py-2 text-left">Rounds</th>
            <th className="px-4 py-2 text-left">Purpose/Theme</th>
            <th className="px-4 py-2 text-left">Female Participants</th>
            <th className="px-4 py-2 text-left">Male Participants</th>
            <th className="px-4 py-2 text-left">Operation</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((sport) => (
            <tr key={sport.id} className="border-t">
              <td className="px-4 py-2">{sport.date}</td>
              <td className="px-4 py-2">{sport.province}</td>
              <td className="px-4 py-2">{sport.district}</td>
              <td className="px-4 py-2">{sport.sector}</td>
              <td className="px-4 py-2">{sport.rounds}</td>
              <td className="px-4 py-2">{sport.purposeTheam}</td>
              <td className="px-4 py-2">{sport.numberFemaleParticipants}</td>
              <td className="px-4 py-2">{sport.numberMaleParticipants}</td>
              <td className="px-4 py-2 flex gap-2">
                <Button
                  onClick={() => {
                    setSportToEdit(sport); // Set the sport for editing
                    setIsAddModalOpen(true);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                 <Edit className="h-4 w-4 mr-1" />
                </Button>
                <Button
                  onClick={() => handleDeleteSport(sport.id)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                
                <Trash2 className="h-4 w-4 mr-1" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AddMassSportModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSportToEdit(null); // Clear edit state on close
        }}
        onAdd={handleAddOrUpdateSport}
        sport={sportToEdit} // Pass sportToEdit for editing
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="py-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{sportToDelete?.purposeTheam}</span>? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SportsForAll;
