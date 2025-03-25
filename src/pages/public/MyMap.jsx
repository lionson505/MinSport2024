import React, { useState, useCallback, useEffect } from 'react';
import GoogleMap from '../../components/reusable/GoogleMap';
import axiosInstance from '../../utils/axiosInstance'; // Import axiosInstance

export default function MyMap() {
  const apiKey = 'AIzaSyA_Is24-zuhqdSyUYlYqx6JGyTrG1iqaiE';
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [infrastructure, setInfrastructure] = useState('');
  const [infrastructureCategory, setInfrastructureCategory] = useState('');
  const [infrastructureSubCategory, setInfrastructureSubCategory] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  useEffect(() => {
    // Fetch facilities, categories, and subcategories from the API
    const fetchData = async () => {
      try {
        const [facilitiesResponse, categoriesResponse, subCategoriesResponse] = await Promise.all([
          axiosInstance.get('/infrastructures'),
          axiosInstance.get('/infrastructure-categories'),
          axiosInstance.get('/infrastructure-subcategories'),
        ]);

        const formattedFacilities = facilitiesResponse.data.map((facility) => ({
          id: facility.id,
          name: facility.name,
          position: {
            lat: facility.latitude,
            lng: facility.longitude,
          },
          infraCategoryId: facility.infraCategoryId,
          infraSubCategoryId: facility.infraSubCategoryId,
          description: facility.description,
          type_level: facility.type_level,
          status: facility.status,
          capacity: facility.capacity,
          location: {
            province: facility.location_province,
            district: facility.location_district,
            sector: facility.location_sector,
            cell: facility.location_cell,
            village: facility.location_village,
          },
          upi: facility.upi,
          plot_area: facility.plot_area,
          construction_date: facility.construction_date,
          owner: facility.owner,
          main_users: facility.main_users,
          types_of_sports: facility.types_of_sports,
          internet_connection: facility.internet_connection,
          electricity_connection: facility.electricity_connection,
          water_connection: facility.water_connection,
          access_road: facility.access_road,
          health_facility: facility.health_facility,
          legal_representative: {
            name: facility.legal_representative_name,
            gender: facility.legal_representative_gender,
            email: facility.legal_representative_email,
            phone: facility.legal_representative_phone,
          },
        }));

        setFacilities(formattedFacilities);
        setFilteredFacilities(formattedFacilities);
        setCategories(categoriesResponse.data);
        setSubCategories(subCategoriesResponse.data);

        // console.log('Fetched facilities:', formattedFacilities);
        // console.log('Fetched categories:', categoriesResponse.data);
        // console.log('Fetched subcategories:', subCategoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleFacilityClick = useCallback((facility) => {
    setSelectedFacility(facility);
    setInfrastructure(facility.name);
    const category = categories.find((cat) => cat.id === facility.infraCategoryId);
    const subCategory = subCategories.find((sub) => sub.id === facility.infraSubCategoryId);

    setInfrastructureCategory(category ? category.name : '');
    setInfrastructureSubCategory(subCategory ? subCategory.name : '');
  }, [categories, subCategories]);

  const handleSearch = useCallback(() => {
    const filtered = facilities.filter(facility =>
      facility.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFacilities(filtered);
  }, [searchQuery, facilities]);

  const handleReset = useCallback(() => {
    setSearchQuery('');
    setFilteredFacilities(facilities);
  }, [facilities]);

  const handleInfrastructureChange = (value) => {
    setInfrastructure(value);
    const selected = facilities.find((facility) => facility.name === value);

    if (selected) {
      const category = categories.find((cat) => cat.id === selected.infraCategoryId);
      const subCategory = subCategories.find((sub) => sub.id === selected.infraSubCategoryId);

      setInfrastructureCategory(category ? category.name : '');
      setInfrastructureSubCategory(subCategory ? subCategory.name : '');
    } else {
      setInfrastructureCategory('');
      setInfrastructureSubCategory('');
    }
  };

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [bookingDateFrom, setBookingDateFrom] = useState('');
  const [bookingDateTo, setBookingDateTo] = useState('');
  const [bookingTimeFrom, setBookingTimeFrom] = useState('');
  const [bookingTimeTo, setBookingTimeTo] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedFacility = facilities.find(facility => facility.name === infrastructure);

    if (!selectedFacility) {
      alert('Please select a valid infrastructure.');
      return;
    }

    const bookingData = {
      infraCategoryId: selectedFacility.infraCategoryId,
      infraSubCategoryId: selectedFacility.infraSubCategoryId,
      infrastructureId: selectedFacility.id,
      name,
      gender,
      email,
      phone,
      reason,
      bookingDateFrom: new Date(`${bookingDateFrom}T00:00:00`).toISOString(),
      bookingDateTo: new Date(`${bookingDateTo}T00:00:00`).toISOString(),
      bookingTimeFrom: new Date(`${bookingDateFrom}T${bookingTimeFrom}`).toISOString(),
      bookingTimeTo: new Date(`${bookingDateTo}T${bookingTimeTo}`).toISOString(),
      status: 'Pending',
    };

    // console.log('Submitting booking data:', bookingData);

    try {
      const response = await axiosInstance.post('/booking-requests', bookingData);
      // console.log('Booking request submitted:', response.data);
      alert('Booking request submitted successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error submitting booking request:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        alert(`Failed to submit booking request: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        console.error('Request data:', error.request);
        alert('No response received from server.');
      } else {
        console.error('Error message:', error.message);
        alert('Error in setting up the request.');
      }
    }
  };

  const handleMapClick = (location) => {
    console.log('Map clicked at:', location);
    // You can add additional logic here if needed
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="lg:text-3xl md:text-2xl text-lg font-bold mb-6 text-center">Sports Facilities in Rwanda</h1>

      <section className="flex flex-col   gap-2">
        <div className='md:w-5/6 w-full'>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Search facilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Search
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Reset
            </button>
          </div>

          <GoogleMap
            apiKey={apiKey}
            center={{ lat: -1.9403, lng: 29.8739 }}
            zoom={8}
            facilities={filteredFacilities}
            onFacilityClick={handleFacilityClick}
            onMapClick={handleMapClick}
          />

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Legend</h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                <span>Stadium</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span>Gym</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                <span>Field</span>
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-center w-full '>
          <div className="bg-white rounded-lg shadow-lg w-full p-6">
            <div className="flex justify-between items-center my-6">
              <h2 className="text-2xl font-bold">Book Visit </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="infrastructure" className="block text-sm font-medium text-gray-700">
                  Select Infrastructure
                </label>
                <select
                  id="infrastructure"
                  className="w-full border-[1px] bg-transparent rounded-lg px-3 py-2"
                  value={infrastructure}
                  onChange={(e) => handleInfrastructureChange(e.target.value)}
                  required
                >
                  <option value="">
                  </option>
                  {facilities.map((facility) =>
                    <option key={facility.id} value={facility.name}>{facility.name}</option>
                  )}
                </select>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mt-4">
                  Infrastructure Category
                </label>
                <input
                  id="category"
                  type="text"
                  value={infrastructureCategory}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                />
                <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mt-4">
                  Infrastructure Sub-Category
                </label>
                <input
                  id="subCategory"
                  type="text"
                  value={infrastructureSubCategory}
                  readOnly
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                />
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mt-4">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Reason
                </label>
                <input
                  id="reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="bookingDateFrom" className="block text-sm font-medium text-gray-700">
                  Booking Date From
                </label>
                <input
                  id="bookingDateFrom"
                  type="date"
                  value={bookingDateFrom}
                  onChange={(e) => setBookingDateFrom(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="bookingDateTo" className="block text-sm font-medium text-gray-700">
                  Booking Date To
                </label>
                <input
                  id="bookingDateTo"
                  type="date"
                  value={bookingDateTo}
                  onChange={(e) => setBookingDateTo(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="bookingTimeFrom" className="block text-sm font-medium text-gray-700">
                  Booking Time From
                </label>
                <input
                  id="bookingTimeFrom"
                  type="time"
                  value={bookingTimeFrom}
                  onChange={(e) => setBookingTimeFrom(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="bookingTimeTo" className="block text-sm font-medium text-gray-700">
                  Booking Time To
                </label>
                <input
                  id="bookingTimeTo"
                  type="time"
                  value={bookingTimeTo}
                  onChange={(e) => setBookingTimeTo(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
