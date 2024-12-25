import React, { useState, useCallback } from 'react'
import GoogleMap from '../../components/reusable/GoogleMap'
import BookingModal from '../../components/reusable/BookingModal'

const sportsFacilities = [
  { id: '1', name: 'Amahoro National Stadium', position: { lat: -1.9441, lng: 30.0619 }, type: 'Football' },
  { id: '2', name: 'Kigali Arena', position: { lat: -1.9530, lng: 30.0645 }, type: 'Basketball' },
  { id: '3', name: 'Nyamirambo Regional Stadium', position: { lat: -1.9772, lng: 30.0444 }, type: 'Football' },
  { id: '4', name: 'Kigali Golf Club', position: { lat: -1.9486, lng: 30.1128 }, type: 'field' },

]

export default function MyMap() {
  const apiKey = 'AIzaSyA_Is24-zuhqdSyUYlYqx6JGyTrG1iqaiE'
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredFacilities, setFilteredFacilities] = useState(sportsFacilities)
  const [infrustructure, setInfrustructure] = useState('');

  const handleFacilityClick = useCallback((facility) => {
    setSelectedFacility(facility)
  }, [])

  const handleSearch = useCallback(() => {
    const filtered = sportsFacilities.filter(facility =>
      facility.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredFacilities(filtered)
  }, [searchQuery])

  const handleReset = useCallback(() => {
    setSearchQuery('')
    setFilteredFacilities(sportsFacilities)
  }, [])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', { name, email, date, message, infrustructure })
    onClose()
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="lg:text-3xl md:text-2xl text-lg font-bold mb-6 text-center">Sports Facilities in Rwanda</h1>

      <section className="flex flex-col md:flex-row md:w-full gap-2">
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

          {selectedFacility && (
            <BookingModal
              isOpen={!!selectedFacility}
              onClose={() => setSelectedFacility(null)}
              facilityName={selectedFacility.name}
            />
          )}
        </div>
        <div className='flex justify-center w-full md:w-1/2'>
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center my-6">
              <h2 className="text-2xl font-bold">Book Visit </h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Select Infrustructure
                </label>
              <select
              className="w-full border-[1px] bg-transparent rounded-lg px-3 py-2"
              value={infrustructure}
              onChange={(e) => setInfrustructure(e.target.value)}
              required
             >
              <option value="">
              </option>
              {sportsFacilities.map((sportsFacility) =>
                <option key={sportsFacility.id}  value={sportsFacility.name}>{sportsFacility.name}</option>
              )}
             </select>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
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
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Preferred Visit Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows="4"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
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
  )
}