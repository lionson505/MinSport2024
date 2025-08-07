import React, { useState, useEffect, Fragment } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function Department() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', supervisor_name: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}departments`);
      setDepartments(res.data.departments || []);
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post(`${API_URL}departments`, form);
      toast.success('Department added');
      setIsAddModalOpen(false);
      setForm({ name: '', email: '', supervisor_name: '' });
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to add department');
    }
  };

  const handleEdit = (dept) => {
    setSelectedDepartment(dept);
    setForm({ name: dept.name, email: dept.email, supervisor_name: dept.supervisor_name });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`${API_URL}departments/${selectedDepartment.id}`, form);
      toast.success('Department updated');
      setIsEditModalOpen(false);
      setSelectedDepartment(null);
      setForm({ name: '', email: '', supervisor_name: '' });
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to update department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      await axios.delete(`${API_URL}departments/${id}`);
      toast.success('Department deleted');
      fetchDepartments();
    } catch (error) {
      toast.error('Failed to delete department');
    }
  };

  const filteredDepartments = departments.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.supervisor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Departments</h2>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white">Add Department</Button>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <Input
          type="text"
          placeholder="Search by name, email, or supervisor..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-64"
        />
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"># Employees</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDepartments.map(dept => (
              <tr key={dept.id}>
                <td className="px-4 py-3 text-sm">{dept.id}</td>
                <td className="px-4 py-3 text-sm">{dept.name}</td>
                <td className="px-4 py-3 text-sm">{dept.email}</td>
                <td className="px-4 py-3 text-sm">{dept.supervisor_name}</td>
                <td className="px-4 py-3 text-sm">{dept.employees?.length || 0}</td>
                <td className="px-4 py-3 text-sm">
                  <Button size="sm" onClick={() => handleEdit(dept)} className="mr-2">Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(dept.id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {filteredDepartments.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">No departments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Add Modal */}
      <Transition appear show={isAddModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsAddModalOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium mb-4">Add Department</Dialog.Title>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Department Name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                    <Input
                      type="email"
                      placeholder="Department Email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                    <Input
                      type="text"
                      placeholder="Supervisor Name"
                      value={form.supervisor_name}
                      onChange={e => setForm(f => ({ ...f, supervisor_name: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button className="bg-blue-600 text-white" onClick={handleAdd}>Add</Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* Edit Modal */}
      <Transition appear show={isEditModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsEditModalOpen(false)}>
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
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium mb-4">Edit Department</Dialog.Title>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Department Name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    />
                    <Input
                      type="email"
                      placeholder="Department Email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                    <Input
                      type="text"
                      placeholder="Supervisor Name"
                      value={form.supervisor_name}
                      onChange={e => setForm(f => ({ ...f, supervisor_name: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    <Button className="bg-blue-600 text-white" onClick={handleEditSubmit}>Save</Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default Department; 