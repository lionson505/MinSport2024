import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '../../utils/axiosInstance';

const CategoryManagementModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [activeTab, setActiveTab] = useState('categories');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchSubcategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/infrastructure-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await axiosInstance.get('/infrastructure-subcategories');
      setSubcategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to fetch subcategories');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      const response = await axiosInstance.post('/infrastructure-categories', { name: newCategory });
      setCategories(prev => [...prev, response.data]);
      setNewCategory('');
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategory.trim() || selectedCategoryId === null) {
      toast.error('Subcategory name and category must be selected');
      return;
    }

    try {
      // Ensure the subcategory is created with the correct format
      const response = await axiosInstance.post('/infrastructure-subcategories', {
        name: newSubcategory,
        categoryId: selectedCategoryId
      });
      setSubcategories(prev => [...prev, response.data]);
      setNewSubcategory('');
      setSelectedCategoryId(null);
      toast.success('Subcategory added successfully');
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast.error('Failed to add subcategory');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axiosInstance.delete(`/infrastructure-categories/${categoryId}`);
      setCategories(prev => prev.filter(category => category.id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    try {
      await axiosInstance.delete(`/infrastructure-subcategories/${subcategoryId}`);
      setSubcategories(prev => prev.filter(subcategory => subcategory.id !== subcategoryId));
      toast.success('Subcategory deleted successfully');
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    }
  };

  const handleEdit = (item, type) => {
    setEditMode(item.id);
    setEditValue(item.name);
  };

  const handleSaveEdit = async (type) => {
    if (!editValue.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      const endpoint = type === 'category' ? '/infrastructure-categories' : '/infrastructure-subcategories';
      const response = await axiosInstance.put(`${endpoint}/${editMode}`, { name: editValue });
      if (type === 'category') {
        setCategories(prev => prev.map(category => 
          category.id === editMode ? response.data : category
        ));
      } else {
        setSubcategories(prev => prev.map(subcategory => 
          subcategory.id === editMode ? response.data : subcategory
        ));
      }
      setEditMode(null);
      setEditValue('');
      toast.success('Updated successfully');
    } catch (error) {
      console.error('Error updating:', error);
      toast.error('Failed to update');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Categories and Subcategories"
      size="2xl"
     >
      <div className="flex flex-col h-[calc(100vh-180px)]">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Category Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add and manage categories and subcategories
          </p>
        </div>

        <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
          <button
            className={`px-4 py-2 ${activeTab === 'categories' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'subcategories' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('subcategories')}
          >
            Subcategories
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {activeTab === 'categories' && (
              <>
                <section className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-base font-semibold mb-4">Add New Category</h3>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAddCategory}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4" />
                      Add Category
                    </Button>
                  </div>
                </section>

                <section>
                  <h3 className="text-base font-semibold mb-4">Current Categories</h3>
                  <div className="space-y-4">
                    {categories.map(category => (
                      <div key={category.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center justify-between">
                          {editMode === category.id ? (
                            <div className="flex gap-2 flex-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1"
                              />
                              <Button onClick={() => handleSaveEdit('category')}>Save</Button>
                              <Button variant="outline" onClick={() => setEditMode(null)}>Cancel</Button>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-medium text-lg">{category.name}</h4>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(category, 'category')}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => handleDeleteCategory(category.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'subcategories' && (
              <>
                <section className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-base font-semibold mb-4">Add New Subcategory</h3>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter subcategory name"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      className="flex-1"
                    />
                    <select
                      value={selectedCategoryId || ''}
                      onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                      className="flex-1 border rounded-md p-2"
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <Button 
                      onClick={handleAddSubcategory}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4" />
                      Add Subcategory
                    </Button>
                  </div>
                </section>

                <section>
                  <h3 className="text-base font-semibold mb-4">Current Subcategories</h3>
                  <div className="space-y-4">
                    {subcategories.map(subcategory => (
                      <div key={subcategory.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center justify-between">
                          {editMode === subcategory.id ? (
                            <div className="flex gap-2 flex-1">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1"
                              />
                              <Button onClick={() => handleSaveEdit('subcategory')}>Save</Button>
                              <Button variant="outline" onClick={() => setEditMode(null)}>Cancel</Button>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-medium text-lg">{subcategory.name}</h4>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(subcategory, 'subcategory')}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => handleDeleteSubcategory(subcategory.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryManagementModal;
