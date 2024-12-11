import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getSportsEvents, addSportsEvent, deleteSportsEvent } from '../services/sportall';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import AddMassSportModal from '../components/AddMassSportModal';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { AlertCircle, Pencil, Download, Trash2, AlertTriangle, Eye, X} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Search, Plus, Filter } from 'lucide-react';
import PageLoading from '../components/ui/PageLoading';
import Message from '../components/ui/Message';

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

  // Add pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [sportToView, setSportToView] = useState(null);

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

  const handleViewSport = (sport) => {
    setSportToView(sport);
    setViewModalOpen(true);
  };

  const filteredData = massSportsData.filter((sport) =>
    Object.values(sport).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {error && <Message type="error" message={error} onClose={() => setError(null)} />}

      <div className="space-y-6">
        {/* Title Section */}
        <h1 className="text-2xl font-bold mb-6">Sports For All Manage</h1>

        {/* Search and Add Button Section */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Mass Sport
          </Button>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64"
                placeholder="Search..."
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showAdvancedSearch ? 'Hide Filters' : 'Show Filters'}
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                className="border rounded px-2 py-1"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sports Table */}
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-2 text-left">Date</TableHead>
                <th className="px-4 py-2 text-left">Province</th>
                <th className="px-4 py-2 text-left">District</th>
                <th className="px-4 py-2 text-left">Sector</th>
                <th className="px-4 py-2 text-left">Rounds</th>
                <th className="px-4 py-2 text-left">Purpose/Theme</th>
                <th className="px-4 py-2 text-left">Female Participants</th>
                <th className="px-4 py-2 text-left">Male Participants</th>
                <th className="px-4 py-2 text-left">Operation</th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((sport) => (
                <TableRow key={sport.id}>
                  <TableCell className="px-4 py-2">{sport.date}</TableCell>
                  <td className="px-4 py-2">{sport.province}</td>
                  <td className="px-4 py-2">{sport.district}</td>
                  <td className="px-4 py-2">{sport.sector}</td>
                  <td className="px-4 py-2">{sport.rounds}</td>
                  <td className="px-4 py-2">{sport.purposeTheam}</td>
                  <td className="px-4 py-2">{sport.numberFemaleParticipants}</td>
                  <td className="px-4 py-2">{sport.numberMaleParticipants}</td>
                  <td className="px-4 py-2 flex gap-1">
                    <button
                      onClick={() => {
                        setSportToEdit(sport);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1 rounded-lg hover:bg-gray-100"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSport(sport.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleViewSport(sport)}
                      className="p-1 rounded-lg hover:bg-gray-100"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center text-sm text-gray-500">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index + 1}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

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

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              View Sport Details
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p><strong>Date:</strong> {sportToView?.date}</p>
            <p><strong>Province:</strong> {sportToView?.province}</p>
            <p><strong>District:</strong> {sportToView?.district}</p>
            <p><strong>Sector:</strong> {sportToView?.sector}</p>
            <p><strong>Cell:</strong> {sportToView?.cell}</p>
            <p><strong>Village:</strong> {sportToView?.village}</p>
            <p><strong>Rounds:</strong> {sportToView?.rounds}</p>
            <p><strong>Purpose/Theme:</strong> {sportToView?.purposeTheam}</p>
            <p><strong>Female Participants:</strong> {sportToView?.numberFemaleParticipants}</p>
            <p><strong>Male Participants:</strong> {sportToView?.numberMaleParticipants}</p>
            <p><strong>Total Participants:</strong> {sportToView?.totalParticipants}</p>
            <p><strong>Organisers:</strong> {sportToView?.organisers}</p>
            <p><strong>Guest of Honor:</strong> {sportToView?.guestOfHonor}</p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SportsForAll;
