import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTourism } from '../../contexts/TourismContext';

const CategoryManagementModal = ({ isOpen, onClose }) => {
  const { categories, updateCategories } = useTourism();
  const [newCategory, setNewCategory] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    if (Object.keys(categories).includes(newCategory)) {
      toast.error('Category already exists');
      return;
    }

    const updatedCategories = {
      ...categories,
      [newCategory]: {
        subCategories: [],
        levels: []
      }
    };

    updateCategories(updatedCategories);
    setNewCategory('');
    toast.success('Category added successfully');
  };

  const handleAddSubCategory = () => {
    if (!selectedCategory) {
      toast.error('Please select a category first');
      return;
    }

    if (!newSubCategory.trim()) {
      toast.error('Subcategory name cannot be empty');
      return;
    }

    if (categories[selectedCategory].subCategories.includes(newSubCategory)) {
      toast.error('Subcategory already exists');
      return;
    }

    const updatedCategories = {
      ...categories,
      [selectedCategory]: {
        ...categories[selectedCategory],
        subCategories: [...categories[selectedCategory].subCategories, newSubCategory]
      }
    };

    updateCategories(updatedCategories);
    setNewSubCategory('');
    toast.success('Subcategory added successfully');
  };

  const handleDeleteCategory = (category) => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
        <h3 className="font-medium mb-2 dark:text-white">Delete Category</h3>
        <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">
          Are you sure you want to delete "{category}"? This will also delete all its subcategories.
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
            onClick={() => {
              const newCategories = { ...categories };
              delete newCategories[category];
              updateCategories(newCategories);
              toast.dismiss(t);
              toast.success('Category deleted successfully');
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    ));
  };

  const handleDeleteSubCategory = (category, subCategory) => {
    const updatedCategories = {
      ...categories,
      [category]: {
        ...categories[category],
        subCategories: categories[category].subCategories.filter(sub => sub !== subCategory)
      }
    };
    updateCategories(updatedCategories);
    toast.success('Subcategory deleted successfully');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Event Categories"
      size="2xl"
    >
      {/* ... rest of the JSX ... */}
    </Modal>
  );
};

export default CategoryManagementModal; 