import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '../components/ui/table';
import { Search, Plus, Filter, X, AlertCircle, Edit } from 'lucide-react';
import Modal from '../components/ui/Modal';
import AddTrainingForm from '../components/forms/AddTrainingForm';
import ActionMenu from '../components/ui/ActionMenu';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';
import PageLoading from '../components/ui/PageLoading';
import Message from '../components/ui/Message';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Button } from '../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import axiosInstance from '../utils/axiosInstance';

const Training = () => {
  const { isDarkMode } = useDarkMode();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [trainings, setTrainings] = useState([]);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Set items per page to 5
  const [trainingToDelete, setTrainingToDelete] = useState(null);
  const [trainingToEdit, setTrainingToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch training data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/trainings');
        setTrainings(response.data);
        setFilteredTrainings(response.data);
        setIsLoading(false);
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Failed to load trainings. Please try again.'
        });
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter trainings based on search query
  useEffect(() => {
    const filtered = trainings.filter((training) =>
      training.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTrainings(filtered);
    setCurrentPage(1); // Reset to first page when search query changes
  }, [searchQuery, trainings]);

  // Handle adding or editing training
  const handleAddOrEditTraining = async (data) => {
    setIsSubmitting(true);
    try {
      let response;
      if (trainingToEdit) {
        response = await axiosInstance.put(`/trainings/${trainingToEdit.id}`, data);
        const updatedTrainings = trainings.map((t) =>
          t.id === trainingToEdit.id ? response.data : t
        );
        setTrainings(updatedTrainings);
        setFilteredTrainings(updatedTrainings);
      } else {
        response = await axiosInstance.post('/trainings', data);
        const newTrainings = [...trainings, response.data];
        setTrainings(newTrainings);
        setFilteredTrainings(newTrainings);
      }
      setShowAddModal(false);
      setMessage({
        type: 'success',
        text: trainingToEdit ? 'Training updated successfully' : 'Training added successfully'
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to add or update training'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a training
  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await axiosInstance.delete(`/trainings/${trainingToDelete.id}`);
      const updatedTrainings = trainings.filter(t => t.id !== trainingToDelete.id);
      setTrainings(updatedTrainings);
      setFilteredTrainings(updatedTrainings);
      setShowDeleteDialog(false);
      setTrainingToDelete(null);
      toast.success('Training deleted successfully');
    } catch (error) {
      toast.error('Failed to delete training');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTrainings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage);

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {message && (
        <Message
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 w-full sm:w-auto"
          disabled={isSubmitting}
        >
          <Plus className="h-5 w-5" />
          <span>Add Training</span>
        </Button>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trainings..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64"
            />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
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

      {/* Trainings Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[20px] text-[11px]">
                <input type="checkbox" className="rounded border-gray-300 w-3 h-3" />
              </TableHead>
              <TableHead className="w-[60px] text-[11px]">ID</TableHead>
              <TableHead className="min-w-[150px] text-[11px]">TRAINING TITLE</TableHead>
              <TableHead className="min-w-[120px] text-[11px]">TRAINING PERIOD</TableHead>
              <TableHead className="w-[80px] text-[11px]">STATUS</TableHead>
              <TableHead className="min-w-[140px] text-[11px]">TRAINING ORGANISER</TableHead>
              {/* <TableHead className="min-w-[120px] text-[11px]">VENUE</TableHead> */}
              <TableHead className="w-[80px] text-[11px]">PARTICIPANTS</TableHead>
              <TableHead className="w-[70px] text-[11px]">ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((training) => (
              <TableRow key={training.id}>
                <TableCell>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    training.status === 'On going' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {training.status}
                  </span>
                </TableCell>
                <TableCell>{training.id}</TableCell>
                <TableCell>{training.title}</TableCell>
                <TableCell>{training.fromDate ? new Date(training.fromDate).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{training.toDate ? new Date(training.toDate).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell>{training.organiser}</TableCell>
                {/* <TableCell>{training.venue}</TableCell> */}
                <TableCell>{training.participants ? training.participants.join(', ') : 'N/A'}</TableCell>
                <TableCell>
                  <ActionMenu
                    onDelete={() => {
                      setTrainingToDelete(training);
                      setShowDeleteDialog(true);
                    }}
                    onEdit={() => {
                      setTrainingToEdit(training);
                      setShowAddModal(true);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between mt-6">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => !isSubmitting && setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Training"
        message="Are you sure you want to delete this training?"
        isSubmitting={isSubmitting}
      />
      
      <Dialog open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open);
        setTrainingToEdit(null); // Reset on closing modal
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{trainingToEdit ? 'Edit Training' : 'Add Training'}</DialogTitle>
            <DialogDescription>
              {trainingToEdit ? 'Update the training details.' : 'Fill in the details for the new training'}
            </DialogDescription>
          </DialogHeader>
          <AddTrainingForm
            onSubmit={handleAddOrEditTraining}
            onCancel={() => setShowAddModal(false)}
            trainingToEdit={trainingToEdit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Training;
