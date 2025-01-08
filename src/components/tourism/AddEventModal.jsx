import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axiosInstance from '../../utils/axiosInstance';
import { locations } from '../../data/locations';

const inputClassName = "h-12 w-full";

const AddEventModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    banner: '',
    video: '',
    category: '',
    subCategory: '',
    province: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    startDate: '2024-12-05',
    endDate: '2024-12-05',
    timeFrom: '09:00 AM',
    timeTo: '10:00 AM',
    maleParticipants: 1,
    femaleParticipants: 1,
    participants: 1,
    participantsFee: 1,
    amountGenerated: 1,
    description: '',
    isPublished: true,
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    // Fetch categories and subcategories from API
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/sports-tourism-categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchSubCategories = async () => {
      try {
        const response = await axiosInstance.get('/sports-tourism-subcategories');
        setSubCategories(response.data);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };

    fetchCategories();
    fetchSubCategories();
  }, []);

  const handleLocationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'province' && { district: '', sector: '', cell: '', village: '' }),
      ...(field === 'district' && { sector: '', cell: '', village: '' }),
      ...(field === 'sector' && { cell: '', village: '' }),
      ...(field === 'cell' && { village: '' }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create a new FormData instance
      const formDataToSend = new FormData();

      // Append all regular fields
      Object.keys(formData).forEach(key => {
        if (key !== 'banner' && key !== 'video') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Append files if they exist
      if (formData.banner) {
        formDataToSend.append('banner', formData.banner);
      }
      if (formData.video) {
        formDataToSend.append('video', formData.video);
      }
console.log(formData)
      const response = await axiosInstance.post('/sports-tourism-events', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Event added:', response.data);
      toast.success('Event added successfully!', {
        description: `${formData.name} has been created.`
      });
      
      // Reload the page after successful submission
      window.location.reload();
      
      onClose();

      setFormData({
        name: '',
        banner: null,
        video: null,
        category: '',
        subCategory: '',
        province: '',
        district: '',
        sector: '',
        cell: '',
        village: '',
        startDate: '2024-12-05',
        endDate: '2024-12-05',
        timeFrom: '09:00 AM',
        timeTo: '10:00 AM',
        maleParticipants: 1,
        femaleParticipants: 1,
        participants: 1,
        participantsFee: 1,
        amountGenerated: 1,
        description: '',
        isPublished: true,
      });
    } catch (error) {
      console.error('Error adding event:', error.response || error.message);
      toast.error('Failed to add event', {
        description: error.response?.data?.message || 'Please try again later.'
      });
    }
  };

  // Add file handling functions
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Sports Tourism Event"
      size="2xl"
    >
      <div className="flex flex-col h-[calc(100vh-180px)]">
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6">
          <div className="space-y-8">
            {/* Basic Information */}
            <section className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Event Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md h-12"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sub Category</label>
                <select
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md h-12"
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((subCategory) => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Province</label>
                <select
                  value={formData.province}
                  onChange={(e) => handleLocationChange('province', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md h-12"
                >
                  <option value="">Select Province</option>
                  {locations.provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">District</label>
                <select
                  value={formData.district}
                  onChange={(e) => handleLocationChange('district', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md h-12"
                  disabled={!formData.province}
                >
                  <option value="">Select District</option>
                  {formData.province &&
                    locations.districts[formData.province].map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => handleLocationChange('sector', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md h-12"
                  disabled={!formData.district}
                >
                  <option value="">Select Sector</option>
                  {formData.district &&
                    locations.sectors[formData.district]?.map((sector) => (
                      <option key={sector} value={sector}>
                        {sector}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cell</label>
                <select
                  value={formData.cell}
                  onChange={(e) => handleLocationChange('cell', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md h-12"
                  disabled={!formData.sector}
                >
                  <option value="">Select Cell</option>
                  {formData.sector &&
                    locations.cells[formData.sector]?.map((cell) => (
                      <option key={cell} value={cell}>
                        {cell}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Village</label>
                <select
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-md h-12"
                  disabled={!formData.cell}
                >
                  <option value="">Select Village</option>
                  {formData.cell &&
                    locations.villages[formData.cell]?.map((village) => (
                      <option key={village} value={village}>
                        {village}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Banner Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'banner')}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Video</label>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'video')}
                  className={inputClassName}
                />
              </div>
            </section>

            {/* Date Section */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Event Schedule</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Time From</label>
                  <Input
                    type="time"
                    value={formData.timeFrom}
                    onChange={(e) => setFormData({ ...formData, timeFrom: e.target.value })}
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Time To</label>
                  <Input
                    type="time"
                    value={formData.timeTo}
                    onChange={(e) => setFormData({ ...formData, timeTo: e.target.value })}
                    required
                    className={inputClassName}
                  />
                </div>
              </div>
            </section>

            {/* Participants and Fees Section */}
            <section>
              <h3 className="text-lg font-semibold mb-4">Participants & Fees</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Male Participants</label>
                  <Input
                    type="number"
                    value={formData.maleParticipants}
                    onChange={(e) => setFormData({ ...formData, maleParticipants: parseInt(e.target.value, 10) })}
                    min="0"
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Female Participants</label>
                  <Input
                    type="number"
                    value={formData.femaleParticipants}
                    onChange={(e) => setFormData({ ...formData, femaleParticipants: parseInt(e.target.value, 10) })}
                    min="0"
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Participants</label>
                  <Input
                    type="number"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value, 10) })}
                    min="0"
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Participants Fee</label>
                  <Input
                    type="number"
                    value={formData.participantsFee}
                    onChange={(e) => setFormData({ ...formData, participantsFee: parseInt(e.target.value, 10) })}
                    min="0"
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount Generated</label>
                  <Input
                    type="number"
                    value={formData.amountGenerated}
                    onChange={(e) => setFormData({ ...formData, amountGenerated: parseInt(e.target.value, 10) })}
                    min="0"
                    required
                    className={inputClassName}
                  />
                </div>
              </div>
            </section>

            {/* Description */}
            <section>
              <div>
                <label className="block text-sm font-medium mb-2">Event Description</label>
                <div className="prose max-w-none">
                  <CKEditor
                    editor={ClassicEditor}
                    data={formData.description}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setFormData({ ...formData, description: data });
                    }}
                    config={{
                      toolbar: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'link',
                        'bulletedList',
                        'numberedList',
                        '|',
                        'outdent',
                        'indent',
                        '|',
                        'blockQuote',
                        'insertTable',
                        'undo',
                        'redo',
                      ],
                      placeholder: 'Enter detailed event description...',
                    }}
                  />
                </div>
              </div>
            </section>
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="min-w-[100px] h-10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-event-form"
              className="min-w-[140px] h-10 bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Add Event
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddEventModal;
