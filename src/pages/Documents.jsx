import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Search, Plus, Eye, Download, Trash, RefreshCw, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import AddDocumentModal from '../components/AddDocumentModal';
import axiosInstance from '../utils/axiosInstance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import PrintButton from '../components/reusable/Print';
import { usePermissionLogger } from '../utils/permissionLogger.js';

function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { isDarkMode } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentToEdit, setDocumentToEdit] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateStatusModalOpen, setUpdateStatusModalOpen] = useState(false);
  const [documentToUpdate, setDocumentToUpdate] = useState(null);
  const logPermissions = usePermissionLogger('documents')
  const [permissions, setPermissions] = useState({
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false
  })

  const fetchPermissions = async ()=> {
    const currentPermissions =await logPermissions();
    await setPermissions(currentPermissions);
  }
  useEffect(() => {
    fetchPermissions();
    console.log("perms:", permissions)
    const fetchDocuments = async () => {
      try {
        const response = await axiosInstance.get('/documents');
        setDocuments(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (error) {
        toast.error('Failed to fetch documents');
      }
    };

    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc =>
    Object.values(doc).some(value =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const currentDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDownload = async (document) => {
    try {
      const response = await axiosInstance.get(`/documents/download/${document.id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.name);
      document.body.appendChild(link);
      link.click();
      toast.success(`Downloading ${document.name}...`);
    } catch {
      toast.error('Failed to download document');
    }
  };

  const handleAddDocument = (newDocument) => {
    setDocuments((prev) => [...prev, newDocument]);
    toast.success('Document added successfully');
  };

  const handleEditDocument = (document) => {
    setDocumentToEdit(document);
    setIsEditModalOpen(true);
  };

  const handleEditConfirm = async (updatedDocument) => {
    try {
      const response = await axiosInstance.put(`/documents/${documentToEdit.id}`, updatedDocument);
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === documentToEdit.id ? response.data : doc))
      );
      toast.success('Document updated successfully');
      setIsEditModalOpen(false);
    } catch {
      toast.error('Failed to update document');
    }
  };

  const handleDelete = (document) => {
    setDocumentToDelete(document);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/documents/${documentToDelete.id}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentToDelete.id));
      toast.success(`Document "${documentToDelete.documentName}" deleted successfully.`);
      setDeleteModalOpen(false);
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setViewModalOpen(true);
  };

  const handleUpdateStatus = (document) => {
    setDocumentToUpdate(document);
    setUpdateStatusModalOpen(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await axiosInstance.patch(`/documents/${documentToUpdate.id}/status`, {
        status: newStatus
      });
      
      setDocuments(prev => prev.map(doc => 
        doc.id === documentToUpdate.id ? { ...doc, status: newStatus } : doc
      ));
      
      toast.success('Document status updated successfully');
      setUpdateStatusModalOpen(false);
    } catch (error) {
      toast.error('Failed to update document status');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Manage Documents</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
        {permissions.canCreate && (
            <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
        )}

      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <PrintButton>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Document Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Document Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Reference No.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 operation">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentDocuments.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{doc.documentName}</td>
                <td className="px-4 py-3 text-sm">{doc.documentType}</td>
                <td className="px-4 py-3 text-sm">{doc.referenceNo}</td>
                <td className="px-4 py-3 text-sm">{doc.phone}</td>
                <td className="px-4 py-3 text-sm">{doc.emailId}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${doc.status === 'Received' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3 operation">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleViewDocument(doc)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {/*<Button size="sm" variant="ghost" onClick={() => handleDownload(doc)}>*/}
                    {/*  <Download className="h-4 w-4" />*/}
                    {/*</Button>*/}
                    {permissions.canUpdate && (
                        <Button size="sm" variant="ghost" onClick={() => handleEditDocument(doc)}>
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                    )}

                    <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(doc)}>
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                    </Button>
                    {
                      permissions.canDelete && (
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(doc)}>
                              <Trash className="h-4 w-4 text-red-600" />
                            </Button>
                        )
                    }

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </PrintButton>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDocument={handleAddDocument}
      />

      {/* Edit Document Modal */}
      {documentToEdit && (
        <AddDocumentModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onAddDocument={handleEditConfirm}
          initialData={documentToEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="py-4">
              Are you sure you want to delete <span className="font-semibold">{documentToDelete?.documentName}</span>?
              This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Document Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>View Document Details</DialogTitle>
          </DialogHeader>
          <DialogDescription className="py-4">
            {selectedDocument && (
              <div className="space-y-4">
                <p><strong>Document Name:</strong> {selectedDocument.documentName}</p>
                <p><strong>Document Type:</strong> {selectedDocument.documentType}</p>
                <p><strong>Reference No.:</strong> {selectedDocument.referenceNo}</p>
                <p><strong>Person/Institution:</strong> {selectedDocument.personOrInstitution}</p>
                <p><strong>Phone:</strong> {selectedDocument.phone}</p>
                <p><strong>Email ID:</strong> {selectedDocument.emailId}</p>
                <p><strong>Date of Recording:</strong> {selectedDocument.dateOfRecording}</p>
                <p><strong>Date of Reception/Sending:</strong> {selectedDocument.dateOfReceptionOrSending}</p>
                <p><strong>Status:</strong> {selectedDocument.status}</p>
              </div>
            )}
          </DialogDescription>
          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setViewModalOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={updateStatusModalOpen} onOpenChange={setUpdateStatusModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Document Status</DialogTitle>
            <DialogDescription>
              Change the status for document: <span className="font-semibold">{documentToUpdate?.documentName}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select onValueChange={handleStatusUpdate} defaultValue={documentToUpdate?.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Received">Received</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processed">Processed</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setUpdateStatusModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Documents;
