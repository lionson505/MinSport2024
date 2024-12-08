import React, { useEffect, useState, Fragment } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Dialog, Transition } from "@headlessui/react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import { Search } from "react-feather";
import { Calendar, Eye, Trash2, XIcon, Check, X } from 'lucide-react';
import AddAppointmentForm from "../components/forms/AddAppointmentForm"; // Import the form

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

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", reason: "" });
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

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/appointments", {
        params: { page: currentPage, search: searchTerm },
      });
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setToastMessage("Failed to fetch appointments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentPage, searchTerm]);

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    const formattedDate = new Date(appointment.request_time).toISOString().slice(0, 19);
    setRescheduleData({
      date: formattedDate,
      reason: "",
    });
    setIsRescheduleModalOpen(true);
  };

  const handleView = (appointment) => {
    setAppointmentDetails(appointment);
    setViewModalOpen(true);
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleData.date || !rescheduleData.reason) {
      setToastMessage("Please fill in all fields before submitting.");
      return;
    }

    try {
      const formattedData = {
        request_date: rescheduleData.date,
      };

      await axiosInstance.put(`/appointments/${selectedAppointment.id}`, formattedData);

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
      Scheduled: "bg-green-100 text-green-800",
      "Not confirmed": "bg-orange-100 text-orange-800",
      Completed: "bg-blue-100 text-blue-800",
    };
    return (
      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${statusClass[status] || ""}`}>
        {status}
      </span>
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleApproveConfirm = async () => {
    try {
      await axiosInstance.put(`/appointments/${selectedAppointment.id}/approve`);
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
      await axiosInstance.put(`/appointments/${selectedAppointment.id}/reject`);
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

  return (
    <div className="p-4">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage('')} />}
      <div className="flex justify-between items-center mb-4">
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
        <Button onClick={() => setAddModalOpen(true)}>Add Appointment</Button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-3 py-2">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300"
                  checked={selectedRows.length === appointments.length}
                  onChange={(e) => {
                    setSelectedRows(e.target.checked ? appointments.map(a => a.id) : []);
                  }}
                />
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">TIME</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">NAMES</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Gender</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Email</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Cellphone</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Purpose</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Institution</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Function</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Other People to Attend</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Other Ministry Staff</th>
              <th className="w-24 px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map((appointment) => (
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
                <td className="px-3 py-2 text-sm">{appointment.email}</td>
                <td className="px-3 py-2 text-sm">{appointment.cellphone}</td>
                <td className="px-3 py-2 text-sm">{appointment.purpose}</td>
                <td className="px-3 py-2 text-sm">{appointment.institution}</td>
                <td className="px-3 py-2 text-sm">{appointment.function}</td>
                <td className="px-3 py-2 text-sm">{appointment.other_people_to_attend}</td>
                <td className="px-3 py-2 text-sm">{appointment.other_ministry_staff}</td>
                <td className="px-3 py-2 flex space-x-2">
                  <button onClick={() => handleView(appointment)}>
                    <Eye className="h-4 w-4" />
                  </button>
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
                  <button
                    className="text-yellow-600 text-sm hover:underline"
                    onClick={() => handleReschedule(appointment)}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                  </button>
                  <button
                    className="text-red-600 text-sm hover:underline"
                    onClick={() => handleDelete(appointment)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>Page {currentPage}</span>
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={appointments.length < 10}
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium text-gray-900">Appointment Details</Dialog.Title>
                <div className="mt-4">
                  <div className="mb-2"><strong>Person to Meet:</strong> {appointmentDetails?.person_to_meet}</div>
                  <div className="mb-2"><strong>Names:</strong> {appointmentDetails?.names}</div>
                  <div className="mb-2"><strong>Email:</strong> {appointmentDetails?.email}</div>
                  <div className="mb-2"><strong>Phone:</strong> {appointmentDetails?.cellphone}</div>
                  <div className="mb-2"><strong>Purpose:</strong> {appointmentDetails?.purpose}</div>
                  <div className="mb-2"><strong>Institution:</strong> {appointmentDetails?.institution}</div>
                  <div className="mb-2"><strong>Function:</strong> {appointmentDetails?.function}</div>
                </div>
                <div className="flex justify-end mt-4">
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
                <div className="mt-4">
                  <Input
                    type="datetime-local"
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                    className="mb-2 w-full"
                  />
                  <Input
                    type="text"
                    placeholder="Reason for rescheduling"
                    value={rescheduleData.reason}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                    className="mb-2 w-full"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleRescheduleSubmit}>
                    Reschedule Appointment
                  </Button>
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
                    <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteConfirm}>
                      Confirm Delete
                    </Button>
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
                <div className="mt-4">
                  <p>Are you sure you want to approve this appointment?</p>
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
                <div className="mt-4">
                  <p>Are you sure you want to reject this appointment?</p>
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

export default Appointments;
