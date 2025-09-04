
import React, { useEffect, useState, Fragment } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import {Search, Calendar, Eye, Trash2, Check, X, Loader2} from 'lucide-react';
import AddAppointmentForm from "../components/forms/AddAppointmentForm";
import PrintButton from "../components/reusable/Print";
import { usePermissionLogger } from "../utils/permissionLogger.js";

const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg">
            {message}
        </div>
    );
};

function PSAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({ from: '', to: '', status: '', person: '' });
    const setFilter = (k, v) => setFilters((p) => ({ ...p, [k]: v }));
    const [loading, setLoading] = useState(true);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [rescheduleData, setRescheduleData] = useState({
        request_date: '',
        request_time: '',
        reason_for_rescheduling: ''
    });
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [appointmentDetails, setAppointmentDetails] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [comment, setComment] = useState('');
    const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
    const [rejectData, setRejectData] = useState({
        request_date: '',
        request_time: '',
        reason_for_rejection: ''
    });
    const [approveData, setApproveData] = useState({
        request_date: '',
        request_time: ''
    });
    const logPermission = usePermissionLogger('appointmen_ps')
    const [permissions, setPermissions] = useState({
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false
    })

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get("/appointments", {
                params: { page: currentPage },
            });
            setAppointments(response.data);
        } catch (error) {
            console.error("Error fetching appointments:", error);
            setToastMessage("Failed to fetch appointments. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    const fetchPermissions = async ()=> {
        await setLoading(true)
        const currentPermissions =await logPermission();
        await setPermissions(currentPermissions);
        await setLoading(false)
    }

    useEffect(() => {
        fetchPermissions();
        fetchAppointments();
    }, [currentPage]);


    if(loading) {
        return(
            <div className="flex animate-spin animate justify-center items-center h-screen">
                <Loader2/>
            </div>
        )

    }

    const handleReschedule = (appointment) => {
        setSelectedAppointment(appointment);
        const formattedDate = new Date(appointment.request_time).toISOString().slice(0, 19);
        setRescheduleData({
            request_date: formattedDate.split('T')[0],
            request_time: formattedDate.split('T')[1],
            reason_for_rescheduling: "",
        });
        setIsRescheduleModalOpen(true);
    };

    const handleView = (appointment) => {
        setAppointmentDetails(appointment);
        setViewModalOpen(true);
    };

    const handleRescheduleSubmit = async () => {
        if (!rescheduleData.request_date || !rescheduleData.request_time || !rescheduleData.reason_for_rescheduling) {
            setToastMessage("Please fill in all fields before submitting.");
            return;
        }

        try {
            const formattedData = {
                request_date: `${rescheduleData.request_date}T00:00:00.000Z`,
                request_time: `${rescheduleData.request_date}T${rescheduleData.request_time}:00.000Z`,
                reason_for_rescheduling: rescheduleData.reason_for_rescheduling
            };

            await axiosInstance.put(`/appointments/${selectedAppointment.id}/reschedule`, formattedData);
            setToastMessage("Appointment rescheduled successfully!");
            setIsRescheduleModalOpen(false);
            fetchAppointments();
        } catch (error) {
            console.error("Error rescheduling appointment:", error);
            const errorMessage = error.response?.data?.message || "Failed to reschedule appointment.";
            setToastMessage(errorMessage);
        }
    };

    const handleDelete = (appointment) => {
        setAppointmentToDelete(appointment);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!appointmentToDelete) return;

        try {
            await axiosInstance.delete(`/appointments/${appointmentToDelete.id}`);
            setAppointments((prev) => prev.filter((appt) => appt.id !== appointmentToDelete.id));
            setToastMessage("Appointment deleted successfully!");
            setDeleteModalOpen(false);
        } catch (error) {
            console.error("Error deleting appointment:", error);
            setToastMessage("Failed to delete appointment.");
        }
    };

    const handleAddAppointment = async (newAppointment) => {
        try {
            const response = await axiosInstance.post("/appointments", newAppointment);
            setAppointments((prev) => [...prev, response.data]);
            setToastMessage("Appointment added successfully!");
            setAddModalOpen(false);
        } catch (error) {
            console.error("Error adding appointment:", error);
            setToastMessage("Failed to add appointment.");
        }
    };

    const renderStatusBadge = (status) => {
        const statusClass = {
            granted: "bg-green-100 text-green-800",
            rescheduled: "bg-blue-100 text-blue-800",
            pending: "bg-yellow-100 text-yellow-800",
            rejected: "bg-red-100 text-red-800"
        };
        return (
            <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${statusClass[status?.toLowerCase()] || "bg-gray-100 text-gray-800"}`}>
                {status}
            </span>
        );
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleApproveConfirm = async () => {
        try {
            const formattedData = {
                request_date: `${approveData.request_date}T${approveData.request_time}:00.000Z`,
                request_time: `${approveData.request_date}T${approveData.request_time}:00.000Z`
            };

            await axiosInstance.put(`/appointments/${selectedAppointment.id}/grant`, formattedData);
            setToastMessage("Appointment approved successfully!");
            setIsApproveModalOpen(false);
            fetchAppointments();
        } catch (error) {
            console.error("Error approving appointment:", error);
            setToastMessage("Failed to approve appointment.");
        }
    };

    const handleRejectConfirm = async () => {
        try {
            const formattedData = {
                request_date: `${rejectData.request_date}T${rejectData.request_time}:00.000Z`,
                request_time: `${rejectData.request_date}T${rejectData.request_time}:00.000Z`,
                reason_for_rejection: rejectData.reason_for_rejection
            };

            await axiosInstance.put(`/appointments/${selectedAppointment.id}/reject`, formattedData);
            setToastMessage("Appointment rejected successfully!");
            setIsRejectModalOpen(false);
            fetchAppointments();
        } catch (error) {
            console.error("Error rejecting appointment:", error);
            setToastMessage("Failed to reject appointment.");
        }
    };

    const handleCommentSubmit = async () => {
        try {
            await axiosInstance.post(`/appointments/${selectedAppointment.id}/comments`, {
                comment: comment
            });
            setToastMessage("Comment added successfully!");
            setIsCommentModalOpen(false);
            setComment('');
            fetchAppointments();
        } catch (error) {
            console.error("Error adding comment:", error);
            setToastMessage("Failed to add comment.");
        }
    };

    const filteredAppointments = appointments.filter((a) => {
        const hay = `${a.names} ${a.institution} ${a.function} ${a.status}`.toLowerCase();
        if (searchTerm && !hay.includes(searchTerm.toLowerCase())) return false;
        if (filters.status && a.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
        if (filters.person && a.person_to_meet !== filters.person) return false;
        if (filters.from && new Date(a.request_date || a.createdAt) < new Date(filters.from)) return false;
        if (filters.to && new Date(a.request_date || a.createdAt) > new Date(filters.to)) return false;
        return true;
    });
    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="p-4">
            {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">PS Appointments</h1>
                <div className="relative w-80">
                    <Input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-8 h-8"
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                {permissions.canCreate && <Button onClick={() => setAddModalOpen(true)}>Add Appointment</Button>}
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <h3 className="text-sm font-semibold mb-3">Search By</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Requested From</label>
                        <Input type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Requested To</label>
                        <Input type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Status</label>
                        <select className="w-full border rounded px-2 py-1" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
                            <option value="">Select</option>
                            <option value="PENDING">Pending</option>
                            <option value="GRANTED">Granted</option>
                            <option value="RESCHEDULED">Rescheduled</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Person</label>
                        <select className="w-full border rounded px-2 py-1" value={filters.person} onChange={(e) => setFilter('person', e.target.value)}>
                            <option value="">Select</option>
                            <option value="MINISTER">MINISTER</option>
                            <option value="PS">PS</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                    <Button variant="outline" onClick={() => setFilters({ from: '', to: '', status: '', person: '' })}>View All</Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <PrintButton title="PS APPOINTMENTS REPORT">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="w-10 px-3 py-2">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    checked={selectedRows.length === filteredAppointments.length}
                                    onChange={(e) => {
                                        setSelectedRows(e.target.checked ? filteredAppointments.map(a => a.id) : []);
                                    }}
                                />
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">TIME</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">NAMES</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Gender</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Cellphone</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Purpose</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Institution</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Function</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                            <th className="w-24 px-3 py-2 text-left text-xs font-medium operation text-gray-500">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {currentItems.map((appointment) => (
                            <tr key={appointment.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300"
                                        checked={selectedRows.includes(appointment.id)}
                                        onChange={(e) => {
                                            setSelectedRows(prev =>
                                                e.target.checked
                                                    ? [...prev, appointment.id]
                                                    : prev.filter(id => id !== appointment.id)
                                            );
                                        }}
                                    />
                                </td>
                                <td className="px-3 py-2 text-sm whitespace-nowrap">
                                    {new Date(appointment.request_time).toLocaleTimeString()}
                                </td>
                                <td className="px-3 py-2 text-sm">{appointment.names}</td>
                                <td className="px-3 py-2 text-sm">{appointment.gender}</td>
                                <td className="px-3 py-2 text-sm">{appointment.cellphone}</td>
                                <td className="px-3 py-2 text-sm">{appointment.purpose}</td>
                                <td className="px-3 py-2 text-sm">{appointment.institution}</td>
                                <td className="px-3 py-2 text-sm">{appointment.function}</td>
                                <td className="px-3 py-2 text-sm">{renderStatusBadge(appointment.status)}</td>
                                <td className="px-3 py-2 flex space-x-2 operation" >
                                    <button onClick={() => handleView(appointment)}>
                                        <Eye className="h-4 w-4" />
                                    </button>
                                    {permissions.canUpdate && (
                                        <>
                                            <button onClick={() => {
                                                setSelectedAppointment(appointment);
                                                setIsApproveModalOpen(true);
                                            }}>
                                                <Check className="h-4 w-4 text-green-600" />
                                            </button>
                                            <button onClick={() => {
                                                setSelectedAppointment(appointment);
                                                setIsRejectModalOpen(true);
                                            }}>
                                                <X className="h-4 w-4 text-red-600" />
                                            </button>
                                        </>
                                    )}
                                    {permissions.canUpdate && (
                                        <button
                                            className="text-yellow-600 text-sm hover:underline"
                                            onClick={() => handleReschedule(appointment)}
                                        >
                                            <Calendar className="h-4 w-4 mr-1" />
                                        </button>
                                    )}
                                    {permissions.canDelete && (
                                        <button
                                            className="text-red-600 text-sm hover:underline"
                                            onClick={() => handleDelete(appointment)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </PrintButton>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end mt-4 space-x-2">
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded-md"
                >
                    Previous
                </Button>

                <div className="flex items-center">
                    <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">
                        {currentPage}
                    </span>
                </div>

                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded-md"
                >
                    Next
                </Button>
            </div>

            <Transition show={viewModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setViewModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">Appointment Details</Dialog.Title>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div><strong>Person to Meet:</strong> {appointmentDetails?.person_to_meet}</div>
                                        <div><strong>Names:</strong> {appointmentDetails?.names}</div>
                                        <div><strong>Gender:</strong> {appointmentDetails?.gender}</div>
                                        <div><strong>Email:</strong> {appointmentDetails?.email}</div>
                                        <div><strong>Phone:</strong> {appointmentDetails?.cellphone}</div>
                                        <div><strong>Purpose:</strong> {appointmentDetails?.purpose}</div>
                                        <div><strong>Institution:</strong> {appointmentDetails?.institution}</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div><strong>Function:</strong> {appointmentDetails?.function}</div>
                                        <div><strong>Request Date:</strong> {new Date(appointmentDetails?.request_date).toLocaleDateString()}</div>
                                        <div><strong>Request Time:</strong> {new Date(appointmentDetails?.request_time).toLocaleTimeString()}</div>
                                        <div><strong>Other Attendees:</strong> {appointmentDetails?.other_people_to_attend}</div>
                                        <div><strong>Other Ministry Staff:</strong> {appointmentDetails?.other_ministry_staff}</div>
                                        <div><strong>Created:</strong> {new Date(appointmentDetails?.createdAt).toLocaleString()}</div>
                                        <div><strong>Last Updated:</strong> {new Date(appointmentDetails?.updatedAt).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-6">
                                    <Button variant="outline" onClick={() => setViewModalOpen(false)}>
                                        Close
                                    </Button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition show={isRescheduleModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsRescheduleModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title className="text-lg font-medium text-gray-900">Reschedule Appointment</Dialog.Title>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Request Date</label>
                                        <Input
                                            type="date"
                                            value={rescheduleData?.request_date?.split('T')[0] || ''}
                                            onChange={(e) => setRescheduleData({ ...rescheduleData, request_date: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Request Time</label>
                                        <Input
                                            type="time"
                                            value={rescheduleData?.request_time?.split('T')[1]?.slice(0, 5) || ''}
                                            onChange={(e) => setRescheduleData({ ...rescheduleData, request_time: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Reason for Rescheduling</label>
                                        <Input
                                            type="text"
                                            placeholder="Enter reason for rescheduling"
                                            value={rescheduleData.reason_for_rescheduling}
                                            onChange={(e) => setRescheduleData({ ...rescheduleData, reason_for_rescheduling: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        {permissions.canUpdate && (
                                            <Button variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>
                                                Cancel
                                            </Button>
                                        )}
                                        {permissions.canUpdate && (
                                            <Button variant="destructive" onClick={handleRescheduleSubmit}>
                                                Confirm Reschedule
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition show={deleteModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setDeleteModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title className="text-lg font-medium text-gray-900">Confirm Delete</Dialog.Title>
                                <div className="mt-4">
                                    <p>Are you sure you want to delete this appointment?</p>
                                    <div className="flex justify-end gap-3 mt-4">
                                        {permissions.canUpdate && (
                                            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                                                Cancel
                                            </Button>
                                        )}
                                        {permissions.canUpdate && (
                                            <Button variant="destructive" onClick={handleDeleteConfirm}>
                                                Confirm Delete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition show={addModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setAddModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title className="text-lg font-medium text-gray-900">Add Appointment</Dialog.Title>
                                <div className="mt-4">
                                    <AddAppointmentForm onSubmit={handleAddAppointment} />
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button variant="default" className="mt-[-48px]" onClick={() => setAddModalOpen(false)}>
                                        Close
                                    </Button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition show={isApproveModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsApproveModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title className="text-lg font-medium text-gray-900">Approve Appointment</Dialog.Title>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Request Date</label>
                                        <Input
                                            type="date"
                                            value={approveData?.request_date?.split('T')[0] || ''}
                                            onChange={(e) => setApproveData({ ...approveData, request_date: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Request Time</label>
                                        <Input
                                            type="time"
                                            value={approveData?.request_time?.split('T')[1]?.slice(0, 5) || ''}
                                            onChange={(e) => setApproveData({ ...approveData, request_time: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={handleApproveConfirm}>
                                            Confirm Approve
                                        </Button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition show={isRejectModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsRejectModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title className="text-lg font-medium text-gray-900">Reject Appointment</Dialog.Title>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Request Date</label>
                                        <Input
                                            type="date"
                                            value={rejectData?.request_date?.split('T')[0] || ''}
                                            onChange={(e) => setRejectData({ ...rejectData, request_date: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Request Time</label>
                                        <Input
                                            type="time"
                                            value={rejectData?.request_time?.split('T')[1]?.slice(0, 5) || ''}
                                            onChange={(e) => setRejectData({ ...rejectData, request_time: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Reason for Rejection</label>
                                        <Input
                                            type="text"
                                            placeholder="Enter reason for rejection"
                                            value={rejectData?.reason_for_rejection || ''}
                                            onChange={(e) => setRejectData({ ...rejectData, reason_for_rejection: e.target.value })}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={handleRejectConfirm}>
                                            Confirm Reject
                                        </Button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition show={isCommentModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsCommentModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title className="text-lg font-medium text-gray-900">Add Comment</Dialog.Title>
                                <div className="mt-4">
                                    <Input
                                        type="text"
                                        placeholder="Comment"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        className="mb-2 w-full"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    <Button variant="outline" onClick={() => setIsCommentModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleCommentSubmit}>
                                        Confirm Comment
                                    </Button>
                                </div>
                            </Dialog.Panel>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}

export default PSAppointments;

