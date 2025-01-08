import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TablePagination,
} from '../components/ui/table';
import {Plus, Search, Filter, Loader2} from 'lucide-react';
import Modal from '../components/ui/Modal';
import ActionMenu from '../components/ui/ActionMenu';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { toast } from 'react-hot-toast';
import PageLoading from '../components/ui/PageLoading';
import Message from '../components/ui/Message';
import { useDarkMode } from '../contexts/DarkModeContext';
import AddPartnerForm from '../components/forms/AddPartnerForm';
import { getPartners, addPartner, deletePartner, editPartner } from '../services/patern';
import PrintButton from '../components/reusable/Print';
import {usePermissionLogger} from "../utils/permissionLogger.js";

const Partners = () => {
  const { isDarkMode } = useDarkMode();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [partners, setPartners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ discipline: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const permissionsLog = usePermissionLogger("partner")
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canView: false,
    canEdit: false,
    canDelete: false
  })

  const fetchAndSetPermissions =async () => {
   await setLoading(true)
    const permissionsCurrent = await permissionsLog();
    await setPermissions(permissionsCurrent);
    await  setLoading(false)
  }


  useEffect(() => {
    fetchAndSetPermissions();
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getPartners();
        if (Array.isArray(data)) {
          setPartners(data);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.message || 'Failed to load partners. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if(loading) {
    return(<div className="flex animate-spin animate justify-center items-center h-screen">
      <Loader2/>
    </div>)

  }

  const handleDelete = async () => {
    if (!selectedPartner) return;
    setIsSubmitting(true);
    try {
      await deletePartner(selectedPartner.id);
      setPartners((prevPartners) => prevPartners.filter((p) => p.id !== selectedPartner.id));
      setMessage({ type: 'success', text: 'Partner deleted successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete partner' });
    } finally {
      setIsSubmitting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleAddPartner = async (formData) => {
    setIsSubmitting(true);
    try {
      let response;
      if (selectedPartner) {
        response = await editPartner(selectedPartner.id, formData);
        setMessage({ type: 'success', text: 'Partner updated successfully' });
      } else {
        response = await addPartner(formData);
        setMessage({ type: 'success', text: 'Partner added successfully' });
      }
      setPartners((prevPartners) => {
        if (selectedPartner) {
          return prevPartners.map((partner) =>
            partner.id === selectedPartner.id ? response : partner
          );
        } else {
          return [...prevPartners, response];
        }
      });
      setShowAddModal(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to add or edit partner.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
  };

  const filteredPartners = partners.filter((partner) => {
    return (
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!filters.discipline || partner.discipline === filters.discipline) &&
      (!filters.status || partner.status === filters.status)
    );
  });

  const indexOfLastPartner = currentPage * itemsPerPage;
  const indexOfFirstPartner = indexOfLastPartner - itemsPerPage;
  const currentPartners = filteredPartners.slice(indexOfFirstPartner, indexOfLastPartner);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {message && (
        <Message
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Partners</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} h-5 w-5`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search partners..."
              className={`pl-10 pr-4 py-2 border rounded-lg w-64 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>
          {permissions.canCreate && (
              <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  disabled={isSubmitting}
              >
                <Plus className="h-5 w-5"/>
                <span>Add Partner</span>
              </button>
          )}

        </div>
      </div>

      {/*<div className="mb-6 flex items-center space-x-4">*/}
      {/*  <div className="flex items-center space-x-2">*/}
      {/*    <Filter className="h-4 w-4 text-gray-500"/>*/}
      {/*    <span className="text-sm font-medium">Filters:</span>*/}
      {/*  </div>*/}
      {/*  <select*/}
      {/*      value={filters.discipline}*/}
      {/*    onChange={(e) => handleFilterChange('discipline', e.target.value)}*/}
      {/*    className="border rounded-lg px-3 py-1.5 text-sm bg-white border-gray-300 text-gray-900"*/}
      {/*  >*/}
      {/*    <option value="">Discipline</option>*/}
      {/*    <option value="Football">Football</option>*/}
      {/*    <option value="Basketball">Basketball</option>*/}
      {/*    <option value="Tennis">Tennis</option>*/}
      {/*  </select>*/}
      {/*  <select*/}
      {/*    value={filters.status}*/}
      {/*    onChange={(e) => handleFilterChange('status', e.target.value)}*/}
      {/*    className="border rounded-lg px-3 py-1.5 text-sm bg-white border-gray-300 text-gray-900"*/}
      {/*  >*/}
      {/*    <option value="">Status</option>*/}
      {/*    <option value="Active">Active</option>*/}
      {/*    <option value="Inactive">Inactive</option>*/}
      {/*  </select>*/}
      {/*</div>*/}

      <div className="rounded-lg bg-white shadow">
        <PrintButton title='Partners Report'>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Sports Discipline</TableHead>
        <TableHead>Business</TableHead>
        <TableHead>Province</TableHead>
        <TableHead>District</TableHead>
        <TableHead>Sector</TableHead>
        <TableHead>Representative Name</TableHead>
        <TableHead>Representative Gender</TableHead>
        {/* <TableHead>Representative Email</TableHead> */}
        {/* <TableHead>Representative Phone</TableHead> */}

        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {currentPartners.map((partner) => (
        <TableRow key={partner.id}>
          <TableCell>{partner.name || 'Not Available'}</TableCell>
          <TableCell>{partner.sports_discipline || 'Not Available'}</TableCell>
          <TableCell>{partner.business || 'Not Available'}</TableCell>
          <TableCell>{partner.location_province || 'Not Available'}</TableCell>
          <TableCell>{partner.location_district || 'Not Available'}</TableCell>
          <TableCell>{partner.location_sector || 'Not Available'}</TableCell>
          <TableCell>{partner.legal_representative_name || 'Not Available'}</TableCell>
          <TableCell>{partner.legal_representative_gender || 'Not Available'}</TableCell>
          {/* <TableCell>{partner.legal_representative_email || 'Not Available'}</TableCell>
          <TableCell>{partner.legal_representative_phone || 'Not Available'}</TableCell> */}

          <TableCell>
            <ActionMenu
              onEdit={() => {
                setSelectedPartner(partner);
                setShowAddModal(true);
              }}
              onDelete={() => {
                setSelectedPartner(partner);
                setShowDeleteDialog(true);
              }}
            />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  </PrintButton>
</div>


      <TablePagination
        totalItems={filteredPartners.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => !isSubmitting && setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Partner"
        message={`Are you sure you want to delete ${selectedPartner?.name}? This action cannot be undone.`}
        isSubmitting={isSubmitting}
      />

      <Modal
        isOpen={showAddModal}
        onClose={() => {
          if (!isSubmitting) {
            setShowAddModal(false);
            setSelectedPartner(null);
          }
        }}
        title={selectedPartner ? 'Edit Partner' : 'Add Partner'}
      >
        <AddPartnerForm
          initialData={selectedPartner}
          onSubmit={handleAddPartner}
          onCancel={() => {
            if (!isSubmitting) {
              setShowAddModal(false);
              setSelectedPartner(null);
            }
          }}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default Partners;
