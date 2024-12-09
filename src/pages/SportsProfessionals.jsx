import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PageLoading from '../components/ui/PageLoading';
import Message from '../components/ui/Message';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../components/ui/table';
import axiosInstance from '../utils/axiosInstance';
import Modal from '../components/ui/Modal';
import AddSportsProfessionalForm from '../components/forms/AddSportsProfessionalForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

const SportsProfessionals = () => {
  const [professionals, setProfessionals] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [functions, setFunctions] = useState([]);

  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [filteredDisciplines, setFilteredDisciplines] = useState([]);
  const [filteredFunctions, setFilteredFunctions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('Professionals');

  const [disciplineForm, setDisciplineForm] = useState({ name: '', type: '' });
  const [functionForm, setFunctionForm] = useState({ name: '', disciplineId: '' });

  const [editingDiscipline, setEditingDiscipline] = useState(null);
  const [addingDiscipline, setAddingDiscipline] = useState(false);
  const [editingFunction, setEditingFunction] = useState(null);
  const [addingFunction, setAddingFunction] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(null);
  const [addingProfessional, setAddingProfessional] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const rowsPerPage = 5;

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDisciplines = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/disciplines');
        setDisciplines(response.data);
        setFilteredDisciplines(response.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error('Error fetching disciplines');
      }
    };

    const fetchFunctions = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/functions');
        setFunctions(response.data);
        setFilteredFunctions(response.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error('Error fetching functions');
      }
    };

    const fetchProfessionals = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/official-referees');
        setProfessionals(response.data);
        setFilteredProfessionals(response.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.error('Error fetching professionals');
      }
    };

    fetchDisciplines();
    fetchFunctions();
    fetchProfessionals();
  }, []);

  useEffect(() => {
    const filterData = () => {
      if (activeTab === 'Professionals') {
        setFilteredProfessionals(
          professionals.filter((professional) =>
            `${professional.firstName} ${professional.lastName} ${professional.function} ${professional.nationality}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
        );
      } else if (activeTab === 'Disciplines') {
        setFilteredDisciplines(
          disciplines.filter((discipline) =>
            `${discipline.name} ${discipline.type}`.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      } else if (activeTab === 'Functions') {
        setFilteredFunctions(
          functions.filter((func) =>
            `${func.name} ${disciplines.find((d) => d.id === func.disciplineId)?.name}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          )
        );
      }
    };

    filterData();
  }, [searchTerm, activeTab, professionals, disciplines, functions]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getCurrentPageData = (data) => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return data.slice(indexOfFirstRow, indexOfLastRow);
  };

  const handleAddDiscipline = async () => {
    try {
      const response = await axiosInstance.post('/disciplines', disciplineForm);
      setDisciplines((prevState) => [...prevState, response.data]);
      setFilteredDisciplines((prevState) => [...prevState, response.data]);
      toast.success('Discipline added successfully');
      setDisciplineForm({ name: '', type: '' });
      setAddingDiscipline(false);
    } catch (error) {
      toast.error('Error adding discipline');
    }
  };

  const handleEditDiscipline = async () => {
    try {
      const response = await axiosInstance.put(`/disciplines/${editingDiscipline.id}`, disciplineForm);
      setDisciplines((prevState) =>
        prevState.map((d) => (d.id === editingDiscipline.id ? response.data : d))
      );
      setFilteredDisciplines((prevState) =>
        prevState.map((d) => (d.id === editingDiscipline.id ? response.data : d))
      );
      toast.success('Discipline updated successfully');
      setEditingDiscipline(null);
      setDisciplineForm({ name: '', type: '' });
    } catch (error) {
      toast.error('Error updating discipline');
    }
  };

  const handleDeleteDiscipline = async () => {
    try {
      await axiosInstance.delete(`/disciplines/${itemToDelete.id}`);
      setDisciplines((prevState) => prevState.filter((d) => d.id !== itemToDelete.id));
      setFilteredDisciplines((prevState) => prevState.filter((d) => d.id !== itemToDelete.id));
      toast.success('Discipline deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Error deleting discipline');
    }
  };

  const handleAddFunction = async () => {
    try {
      const payload = {
        name: functionForm.name,
        disciplineId: Number(functionForm.disciplineId)
      };

      if (!payload.disciplineId || !payload.name) {
        toast.error('Please ensure both name and discipline are selected');
        return;
      }

      const response = await axiosInstance.post('/functions', payload);
      setFunctions((prevState) => [...prevState, response.data]);
      setFilteredFunctions((prevState) => [...prevState, response.data]);
      toast.success('Function added successfully');
      setFunctionForm({ name: '', disciplineId: '' });
      setAddingFunction(false);
    } catch (error) {
      toast.error('Error adding function');
    }
  };

  const handleEditFunction = async () => {
    try {
      const response = await axiosInstance.put(`/functions/${editingFunction.id}`, functionForm);
      setFunctions((prevState) =>
        prevState.map((f) => (f.id === editingFunction.id ? response.data : f))
      );
      setFilteredFunctions((prevState) =>
        prevState.map((f) => (f.id === editingFunction.id ? response.data : f))
      );
      toast.success('Function updated successfully');
      setEditingFunction(null);
      setFunctionForm({ name: '', disciplineId: '' });
    } catch (error) {
      toast.error('Error updating function');
    }
  };

  const handleDeleteFunction = async () => {
    try {
      await axiosInstance.delete(`/functions/${itemToDelete.id}`);
      setFunctions((prevState) => prevState.filter((f) => f.id !== itemToDelete.id));
      setFilteredFunctions((prevState) => prevState.filter((f) => f.id !== itemToDelete.id));
      toast.success('Function deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Error deleting function');
    }
  };

  const handleAddProfessional = async (professionalData) => {
    try {
      const response = await axiosInstance.post('/official-referees', professionalData);
      setProfessionals((prevState) => [...prevState, response.data]);
      setFilteredProfessionals((prevState) => [...prevState, response.data]);
      toast.success('Professional added successfully');
      setAddingProfessional(false);
    } catch (error) {
      toast.error('Error adding professional');
    }
  };

  const handleEditProfessional = async (professionalData) => {
    try {
      const response = await axiosInstance.put(`/official-referees/${editingProfessional.id}`, professionalData);
      setProfessionals((prevState) =>
        prevState.map((p) => (p.id === editingProfessional.id ? response.data : p))
      );
      setFilteredProfessionals((prevState) =>
        prevState.map((p) => (p.id === editingProfessional.id ? response.data : p))
      );
      toast.success('Professional updated successfully');
      setEditingProfessional(null);
    } catch (error) {
      toast.error('Error updating professional');
    }
  };

  const handleDeleteProfessional = async () => {
    try {
      await axiosInstance.delete(`/official-referees/${itemToDelete.id}`);
      setProfessionals((prevState) => prevState.filter((p) => p.id !== itemToDelete.id));
      setFilteredProfessionals((prevState) => prevState.filter((p) => p.id !== itemToDelete.id));
      toast.success('Professional deleted successfully');
      setDeleteModalOpen(false);
    } catch (error) {
      toast.error('Error deleting professional');
    }
  };

  const renderDisciplineRow = (discipline) => (
    <TableRow key={discipline.id}>
      <TableCell>{discipline.name}</TableCell>
      <TableCell>{discipline.type}</TableCell>
      <TableCell>
        <button
          onClick={() => {
            setEditingDiscipline(discipline);
            setDisciplineForm({ name: discipline.name, type: discipline.type });
          }}
          className="p-2 text-blue-500 hover:bg-blue-100 rounded-md focus:outline-none"
          title="Edit Discipline"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setItemToDelete(discipline);
            setDeleteModalOpen(true);
          }}
          className="p-2 text-red-500 hover:bg-red-100 rounded-md focus:outline-none ml-2"
          title="Delete Discipline"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </TableCell>
    </TableRow>
  );

  const renderFunctionRow = (func) => (
    <TableRow key={func.id}>
      <TableCell>{func.name}</TableCell>
      <TableCell>{disciplines.find((d) => d.id === func.disciplineId)?.name}</TableCell>
      <TableCell>
        <button
          onClick={() => {
            setEditingFunction(func);
            setFunctionForm({ name: func.name, disciplineId: func.disciplineId });
          }}
          className="p-2 text-blue-500 hover:bg-blue-100 rounded-md focus:outline-none"
          title="Edit Function"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setItemToDelete(func);
            setDeleteModalOpen(true);
          }}
          className="p-2 text-red-500 hover:bg-red-100 rounded-md focus:outline-none ml-2"
          title="Delete Function"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </TableCell>
    </TableRow>
  );

  const renderProfessionalRow = (professional) => (
    <TableRow key={professional.id}>
      <TableCell>{professional.firstName}</TableCell>
      <TableCell>{professional.lastName}</TableCell>
      <TableCell>{professional.function}</TableCell>
      <TableCell>{professional.nationality}</TableCell>
      <TableCell>
        <button
          onClick={() => {
            setEditingProfessional(professional);
            setAddingProfessional(true);
          }}
          className="p-2 text-blue-500 hover:bg-blue-100 rounded-md focus:outline-none"
          title="Edit Professional"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setItemToDelete(professional);
            setDeleteModalOpen(true);
          }}
          className="p-2 text-red-500 hover:bg-red-100 rounded-md focus:outline-none ml-2"
          title="Delete Professional"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="p-6 bg-gray-50">
      {message && (
        <Message type={message.type} message={message.text} onClose={() => setMessage(null)} />
      )}

      <div className="mb-6 overflow-x-auto">
        <nav className="flex space-x-4 min-w-max">
          <button
            onClick={() => setActiveTab('Professionals')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'Professionals' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sports Professionals
          </button>
          <button
            onClick={() => setActiveTab('Disciplines')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'Disciplines' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Manage Disciplines
          </button>
          <button
            onClick={() => setActiveTab('Functions')}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'Functions' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Manage Functions
          </button>
        </nav>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {activeTab === 'Professionals' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h3 className="text-xl font-semibold">Sports Professionals</h3>
            <Button onClick={() => setAddingProfessional(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Function</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{getCurrentPageData(filteredProfessionals).map(renderProfessionalRow)}</TableBody>
          </Table>
          <div className="flex justify-between mt-4">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage * rowsPerPage >= filteredProfessionals.length}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'Disciplines' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h3 className="text-xl font-semibold">Manage Disciplines</h3>
            <Button onClick={() => setAddingDiscipline(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{getCurrentPageData(filteredDisciplines).map(renderDisciplineRow)}</TableBody>
          </Table>
          <div className="flex justify-between mt-4">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage * rowsPerPage >= filteredDisciplines.length}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'Functions' && (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h3 className="text-xl font-semibold">Manage Functions</h3>
            <Button onClick={() => setAddingFunction(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{getCurrentPageData(filteredFunctions).map(renderFunctionRow)}</TableBody>
          </Table>
          <div className="flex justify-between mt-4">
            <Button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage * rowsPerPage >= filteredFunctions.length}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {(addingDiscipline || editingDiscipline !== null) && (
        <Modal
          isOpen={addingDiscipline || editingDiscipline !== null}
          onClose={() => {
            setAddingDiscipline(false);
            setEditingDiscipline(null);
          }}
          title={editingDiscipline ? 'Edit Discipline' : 'Add Discipline'}
        >
         <form
  onSubmit={(e) => {
    e.preventDefault();
    if (editingDiscipline) {
      handleEditDiscipline();
    } else {
      handleAddDiscipline();
    }
  }}
  className="max-w-lg mx-auto space-y-6 p-4 border rounded-lg shadow-lg"
>
  <div className="space-y-4">
    {/* Discipline Name */}
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#1B2559]">Name</label>
      <input
        type="text"
        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4318FF] text-sm"
        value={disciplineForm.name}
        onChange={(e) => setDisciplineForm({ ...disciplineForm, name: e.target.value })}
        required
        placeholder="Enter discipline name"
      />
    </div>

    {/* Discipline Type */}
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#1B2559]">Type</label>
      <input
        type="text"
        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4318FF] text-sm"
        value={disciplineForm.type}
        onChange={(e) => setDisciplineForm({ ...disciplineForm, type: e.target.value })}
        required
        placeholder="Enter discipline type"
      />
    </div>

    {/* Save Button */}
    <div className="flex justify-end space-x-4">
      <Button
        type="submit"
        className="px-6 py-3 text-sm font-semibold text-white bg-[#4318FF] hover:bg-[#3600FF] rounded-lg focus:outline-none focus:ring-2"
      >
        Save
      </Button>
    </div>
  </div>
</form>

        </Modal>
      )}

      {(addingFunction || editingFunction !== null) && (
        <Modal
          isOpen={addingFunction || editingFunction !== null}
          onClose={() => {
            setAddingFunction(false);
            setEditingFunction(null);
          }}
          title={editingFunction ? 'Edit Function' : 'Add Function'}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingFunction) {
                handleEditFunction();
              } else {
                handleAddFunction();
              }
            }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block font-semibold">Name</label>
                <input
                  type="text"
                  className="input"
                  value={functionForm.name}
                  onChange={(e) => setFunctionForm({ ...functionForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block font-semibold">Discipline</label>
                <select
                  className="input"
                  value={functionForm.disciplineId}
                  onChange={(e) => setFunctionForm({ ...functionForm, disciplineId: e.target.value })}
                  required
                >
                  <option value="">Select Discipline</option>
                  {disciplines.map((discipline) => (
                    <option key={discipline.id} value={discipline.id}>
                      {discipline.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      )}

      <Modal
        isOpen={addingProfessional || editingProfessional !== null}
        onClose={() => {
          setAddingProfessional(false);
          setEditingProfessional(null);
        }}
        title={editingProfessional ? 'Edit Professional' : 'Add Professional'}
      >
        <AddSportsProfessionalForm
          onCancel={() => {
            setAddingProfessional(false);
            setEditingProfessional(null);
          }}
          onSubmit={editingProfessional ? handleEditProfessional : handleAddProfessional}
          initialData={editingProfessional || { firstName: '', lastName: '', function: '', nationality: '' }}
          isSubmitting={isLoading}
        />
      </Modal>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="py-4">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{itemToDelete?.name || itemToDelete?.firstName}</span>? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {
              if (activeTab === 'Professionals') handleDeleteProfessional();
              else if (activeTab === 'Disciplines') handleDeleteDiscipline();
              else if (activeTab === 'Functions') handleDeleteFunction();
            }}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SportsProfessionals;
