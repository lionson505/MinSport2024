import React, { useState, useEffect } from 'react';
import { redirect, useLocation, useNavigate } from 'react-router-dom';
import axiosInstance from '../../lib/axios.js';


const Toast = ({ message, onClose, isError }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 ${isError ? 'bg-red-600' : 'bg-green-600'} text-white p-4 rounded shadow-lg max-w-md z-50`}>
            <div className="flex items-center">
        <span className="mr-2">
          {isError ? '⚠️' : '✓'}
        </span>
                {message}
            </div>
        </div>
    );
};

const AppointmentRequest = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        person_to_meet: 'MINISTER',
        names: '',
        gender: '',
        email: '',
        cellphone: '',
        purpose: '',
        request_date: '',
        request_time: '',
        institution: '',
        function: '.',
        other_people_to_attend: '',
        other_ministry_staff: '.',
    });


    const [loading, setLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const personToMeet = searchParams.get('to');
        if (personToMeet === 'minister' || personToMeet === 'ps') {
            setFormData(prev => ({ ...prev, person_to_meet: personToMeet.toUpperCase() }));
        } else {
            navigate('/notAuthorized');
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setIsError(false);



        try {
            const combinedData = {
                ...formData,
                request_date: `${formData.request_date}T${formData.request_time}`,
                request_time: `${formData.request_date}T${formData.request_time}`
            };

            console.log("data being sent" ,combinedData)

            const response = await axiosInstance.post('/appointments', combinedData);
            setToastMessage(response.data.message)
            setToastMessage('Your appointment request has been successfully submitted. You will receive a confirmation email shortly.');
        } catch (err) {
            console.error('Error:', err);
            setToastMessage('An error occurred while submitting your request. Please try again later.');
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-blue-900 text-white py-1 px-1 shadow-lg">
                <a href={'/'} >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center space-x-2">
                        <img
                            src="/logo/logo.svg"
                            alt="Ministry Logo"
                            className="h-20 w-20"
                        />
                        <div>
                            <h1 className="text-2xl font-bold">Ministry of Sports</h1>
                        </div>
                    </div>
                </div>
                </a>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Appointment Request Form - {formData.person_to_meet === 'MINISTER' ? 'Minister' : 'Permanent Secretary'}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Please fill in all required fields marked with an asterisk (*)
                        </p>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.names}
                                    onChange={(e) => setFormData(prev => ({ ...prev, names: e.target.value }))}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender *
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.gender}
                                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.cellphone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, cellphone: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Purpose of Meeting *
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="4"
                                    value={formData.purpose}
                                    onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preferred Date *
                                </label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.request_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, request_date: e.target.value }))}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preferred Time *
                                </label>
                                <input
                                    type="time"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.request_time}
                                    onChange={(e) => setFormData(prev => ({ ...prev, request_time: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Additional Attendees
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.other_people_to_attend}
                                    onChange={(e) => setFormData(prev => ({ ...prev, other_people_to_attend: e.target.value }))}
                                    placeholder="Names of other people attending (if any)"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                className="w-full bg-blue-900 text-white py-3 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">⌛</span>
                    Processing...
                  </span>
                                ) : (
                                    'Submit Appointment Request'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {toastMessage && (
                <Toast
                    message={toastMessage}
                    onClose={() => setToastMessage('')}
                    isError={isError}
                />
            )}
        </div>
    );
};

export default AppointmentRequest;