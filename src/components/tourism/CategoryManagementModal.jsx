import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Plus, X, Trash2, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '../../utils/axiosInstance';

const CategoryManagementModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState({});
  const [newCategory, setNewCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [subCategoryDescription, setSubCategoryDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [editingSubCategoryCategory, setEditingSubCategoryCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/sports-tourism-categories');
        const categoriesData = response.data.reduce((acc, category) => {
          acc[category.id] = {
            name: category.name,
            subCategories: [],
          };
          return acc;
        }, {});
  
        // Fetch subcategories separately if they are not included in the category response
        const subcategoriesResponse = await axiosInstance.get('/sports-tourism-subcategories');
        const subcategories = subcategoriesResponse.data;
  
        // Associate subcategories with their respective categories
        subcategories.forEach(subcategory => {
          const { categoryId } = subcategory;
          if (categoriesData[categoryId]) {
            categoriesData[categoryId].subCategories.push(subcategory);
          }
        });
  
        setCategories(categoriesData);
      } catch (error) {
        toast.error('Failed to fetch categories or subcategories');
      }
    };
  
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);
  
  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      const response = await axiosInstance.post('/sports-tourism-categories', {
        name: newCategory,
      });

      const newCategoryData = response.data;
      setCategories(prevCategories => ({
        ...prevCategories,
        [newCategoryData.id]: {
          name: newCategoryData.name,
          subCategories: [],
        },
      }));
      setNewCategory('');
      toast.success('Category added successfully');
    } catch (error) {
      console.error('Error adding category:', error.response || error.message);
      toast.error('Failed to add category');
    }
  };

  const handleAddSubCategory = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category first');
      return;
    }

    if (!newSubCategory.trim()) {
      toast.error('Subcategory name cannot be empty');
      return;
    }

    const payload = {
      name: newSubCategory,
      categoryId: Number(selectedCategory),
      description: subCategoryDescription,
    };

    try {
      const response = await axiosInstance.post('/sports-tourism-subcategories', payload);

      setCategories(prevCategories => ({
        ...prevCategories,
        [selectedCategory]: {
          ...prevCategories[selectedCategory],
          subCategories: [
            ...prevCategories[selectedCategory].subCategories,
            response.data,
          ],
        },
      }));

      setNewSubCategory('');
      setSubCategoryDescription('');
      toast.success('Subcategory added successfully');
    } catch (error) {
      toast.error('Failed to add subcategory');
    }
  };

  const handleUpdateCategory = async (categoryId, newName) => {
    try {
      await axiosInstance.put(`/sports-tourism-categories/${categoryId}`, { name: newName });
      setCategories(prevCategories => ({
        ...prevCategories,
        [categoryId]: {
          ...prevCategories[categoryId],
          name: newName,
        },
      }));
      setEditingCategory(null);
      toast.success('Category updated successfully');
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleUpdateSubCategory = async (categoryId, subCategoryId, newName, newDescription, newCategoryId) => {
    try {
      await axiosInstance.put(`/sports-tourism-subcategories/${subCategoryId}`, {
        name: newName,
        description: newDescription,
        categoryId: newCategoryId,
      });

      // Move subcategory to the new category if the category has changed
      if (categoryId !== newCategoryId) {
        setCategories(prevCategories => {
          const updatedCategories = { ...prevCategories };
          // Remove from old category
          updatedCategories[categoryId].subCategories = updatedCategories[categoryId].subCategories.filter(sub => sub.id !== subCategoryId);
          // Add to new category
          updatedCategories[newCategoryId].subCategories.push({ id: subCategoryId, name: newName, description: newDescription, categoryId: newCategoryId });
          return updatedCategories;
        });
      } else {
        setCategories(prevCategories => ({
          ...prevCategories,
          [categoryId]: {
            ...prevCategories[categoryId],
            subCategories: prevCategories[categoryId].subCategories.map(sub => 
              sub.id === subCategoryId ? { ...sub, name: newName, description: newDescription } : sub
            ),
          },
        }));
      }

      setEditingSubCategory(null);
      toast.success('Subcategory updated successfully');
    } catch (error) {
      toast.error('Failed to update subcategory');
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await axiosInstance.delete(`/sports-tourism-categories/${categoryToDelete}`);
      setCategories(prevCategories => {
        const newCategories = { ...prevCategories };
        delete newCategories[categoryToDelete];
        return newCategories;
      });
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const handleDeleteSubCategory = async (categoryId, subCategoryId) => {
    try {
      await axiosInstance.delete(`/sports-tourism-subcategories/${subCategoryId}`);
      setCategories(prevCategories => ({
        ...prevCategories,
        [categoryId]: {
          ...prevCategories[categoryId],
          subCategories: prevCategories[categoryId].subCategories.filter(sub => sub.id !== subCategoryId),
        },
      }));
      toast.success('Subcategory deleted successfully');
    } catch (error) {
      toast.error('Failed to delete subcategory');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Event Categories"
      size="2xl"
    >
      <div className="flex flex-col h-[calc(100vh-180px)]">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Event Category Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add and manage event categories and their subcategories
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-8 py-6">
            <section className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-4">Add New Category</h3>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </section>

            <section className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-base font-semibold mb-4">Add New Subcategory</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  className="flex h-10 w-full sm:w-1/3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {Object.entries(categories).map(([id, category]) => (
                    <option key={id} value={id}>{category.name}</option>
                  ))}
                </select>
                <div className="flex flex-1 gap-3">
                  <Input
                    placeholder="Enter subcategory name"
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Enter description"
                    value={subCategoryDescription}
                    onChange={(e) => setSubCategoryDescription(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddSubCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-base font-semibold mb-4">Current Categories</h3>
              <div className="space-y-4">
                {Object.entries(categories).map(([categoryId, data]) => (
                  <div key={categoryId} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                    <div
                      className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleCategory(categoryId)}
                    >
                      <div className="flex items-center">
                        {expandedCategories[categoryId] ? (
                          <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        {editingCategory === categoryId ? (
                          <Input
                            value={data.name}
                            onChange={(e) => setCategories(prev => ({
                              ...prev,
                              [categoryId]: { ...prev[categoryId], name: e.target.value }
                            }))}
                            className="flex-1"
                          />
                        ) : (
                          <h4 className="font-medium text-lg">{data.name}</h4>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {editingCategory === categoryId ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateCategory(categoryId, data.name)}
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCategory(categoryId)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => {
                            setCategoryToDelete(categoryId);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {expandedCategories[categoryId] && (
                      <div className="p-4">
                        <div className="space-y-2">
                          {data.subCategories.map(subcategory => (
                            <div 
                              key={subcategory.id} 
                              className="flex flex-col py-2 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-md"
                            >
                              <div className="flex justify-between items-center">
                                {editingSubCategory === subcategory.id ? (
                                  <>
                                    <select
                                      className="flex h-10 w-full sm:w-1/3 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                      value={editingSubCategoryCategory || subcategory.categoryId}
                                      onChange={(e) => setEditingSubCategoryCategory(e.target.value)}
                                    >
                                      {Object.entries(categories).map(([id, category]) => (
                                        <option key={id} value={id}>{category.name}</option>
                                      ))}
                                    </select>
                                    <Input
                                      value={subcategory.name}
                                      onChange={(e) => setCategories(prev => ({
                                        ...prev,
                                        [categoryId]: {
                                          ...prev[categoryId],
                                          subCategories: prev[categoryId].subCategories.map(sub =>
                                            sub.id === subcategory.id ? { ...sub, name: e.target.value } : sub
                                          ),
                                        },
                                      }))}
                                      className="flex-1"
                                    />
                                    <Input
                                      value={subcategory.description}
                                      onChange={(e) => setCategories(prev => ({
                                        ...prev,
                                        [categoryId]: {
                                          ...prev[categoryId],
                                          subCategories: prev[categoryId].subCategories.map(sub =>
                                            sub.id === subcategory.id ? { ...sub, description: e.target.value } : sub
                                          ),
                                        },
                                      }))}
                                      className="flex-1"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleUpdateSubCategory(categoryId, subcategory.id, subcategory.name, subcategory.description, editingSubCategoryCategory || subcategory.categoryId)}
                                    >
                                      Save
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <span className="text-sm font-semibold">{subcategory.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingSubCategory(subcategory.id);
                                        setEditingSubCategoryCategory(subcategory.categoryId);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => handleDeleteSubCategory(categoryId, subcategory.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-xs text-gray-500">Category ID: {categoryId}</p>
                              <p className="text-xs text-gray-500">Description: {subcategory.description}</p>
                              <p className="text-xs text-gray-500">Created At: {new Date(subcategory.createdAt).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">Updated At: {new Date(subcategory.updatedAt).toLocaleDateString()}</p>
                            </div>
                          ))}
                          {data.subCategories.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                              No subcategories yet
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
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

      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Delete"
        >
          <div className="p-4">
            <p>Are you sure you want to delete this category? This will also delete all its subcategories.</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteCategory}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
};

export default CategoryManagementModal;
