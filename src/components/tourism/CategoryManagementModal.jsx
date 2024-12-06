import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/input'
import { Plus, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import axiosInstance from '../../utils/axiosInstance'

const CategoryManagementModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState({})
  const [newCategory, setNewCategory] = useState('')
  const [newSubCategory, setNewSubCategory] = useState('')
  const [subCategoryDescription, setSubCategoryDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/sports-tourism-categories')
        const categoriesData = response.data.reduce((acc, category) => {
          acc[category.id] = {
            name: category.name,
            subCategories: category.subCategories || [],
          }
          return acc
        }, {})
        setCategories(categoriesData)
      } catch (error) {
        toast.error('Failed to fetch categories')
      }
    }

    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty')
      return
    }

    try {
      const response = await axiosInstance.post('/sports-tourism-categories', {
        name: newCategory,
      })

      const newCategoryData = response.data
      setCategories(prevCategories => ({
        ...prevCategories,
        [newCategoryData.id]: {
          name: newCategoryData.name,
          subCategories: [],
        },
      }))
      setNewCategory('')
      toast.success('Category added successfully')
    } catch (error) {
      console.error('Error adding category:', error.response || error.message)
      toast.error('Failed to add category')
    }
  }

  const handleAddSubCategory = async () => {
    if (!selectedCategory) {
      toast.error('Please select a category first')
      return
    }

    if (!newSubCategory.trim()) {
      toast.error('Subcategory name cannot be empty')
      return
    }

    const payload = {
      name: newSubCategory,
      categoryId: selectedCategory,
      description: subCategoryDescription
    };
    
    

    console.log('Payload being sent:', payload)

    try {
      const response = await axiosInstance.post('/sports-tourism-subcategories', payload);
      console.log('API Response:', response.data);
      // Update state with new subcategory
    } catch (error) {
      if (error.response) {
        console.error('Server Error:', error.response.data);
        toast.error(error.response.data.message || 'Failed to add subcategory');
      } else {
        console.error('Error:', error.message);
        toast.error('Failed to add subcategory');
      }
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <h3 className="font-medium mb-2 dark:text-white">Delete Category</h3>
        <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
          Are you sure you want to delete this category? This will also delete all its subcategories.
        </p>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.dismiss(t)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              try {
                await axiosInstance.delete(`/sports-tourism-categories/${categoryId}`)
                setCategories(prevCategories => {
                  const newCategories = { ...prevCategories }
                  delete newCategories[categoryId]
                  return newCategories
                })
                toast.dismiss(t)
                toast.success('Category deleted successfully')
              } catch (error) {
                console.error('Error deleting category:', error.response || error.message)
                toast.error('Failed to delete category')
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    ))
  }

  const handleDeleteSubCategory = async (categoryId, subCategoryId) => {
    try {
      await axiosInstance.delete(`/sports-tourism-subcategories/${subCategoryId}`)
      setCategories(prevCategories => ({
        ...prevCategories,
        [categoryId]: {
          ...prevCategories[categoryId],
          subCategories: prevCategories[categoryId].subCategories.filter(sub => sub.id !== subCategoryId),
        },
      }))
      toast.success('Subcategory deleted successfully')
    } catch (error) {
      console.error('Error deleting subcategory:', error.response || error.message)
      toast.error('Failed to delete subcategory')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Event Categories"
      size="2xl"
    >
      <div className="flex flex-col h-[calc(100vh-180px)]">
        {/* Form Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Event Category Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add and manage event categories and their subcategories
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-8 py-6">
            {/* Add Category Section */}
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

            {/* Add Subcategory Section */}
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

            {/* Categories List */}
            <section>
              <h3 className="text-base font-semibold mb-4">Current Categories</h3>
              <div className="space-y-4">
                {Object.entries(categories).map(([categoryId, data]) => (
                  <div key={categoryId} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 flex items-center justify-between">
                      <h4 className="font-medium text-lg">{data.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDeleteCategory(categoryId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-4">
                      <div className="space-y-2">
                        {data.subCategories.map(subcategory => (
                          <div 
                            key={subcategory.id} 
                            className="flex items-center justify-between py-2 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-md"
                          >
                            <span className="text-sm">{subcategory.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDeleteSubCategory(categoryId, subcategory.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        {data.subCategories.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                            No subcategories yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CategoryManagementModal
