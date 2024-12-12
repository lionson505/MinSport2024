// 'use client'

// import { useState } from 'react'
// import GoogleMap from '../GoogleMap'
// import BookingModal from '../BookingModal'

// const sportsFacilities = [
//   { id: '1', name: 'Amahoro National Stadium', position: { lat: -1.9441, lng: 30.0619 }, type: 'stadium' },
//   { id: '2', name: 'Kigali Arena', position: { lat: -1.9530, lng: 30.0645 }, type: 'gym' },
//   { id: '3', name: 'Nyamirambo Regional Stadium', position: { lat: -1.9772, lng: 30.0444 }, type: 'stadium' },
//   { id: '4', name: 'Kigali Golf Club', position: { lat: -1.9486, lng: 30.1128 }, type: 'field' },
//   { id: '5', name: 'Cercle Sportif de Kigali', position: { lat: -1.9537, lng: 30.0652 }, type: 'gym' },
// ]

// export default function Home() {
//   const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
//   const [selectedFacility, setSelectedFacility] = useState<typeof sportsFacilities[0] | null>(null)

//   const handleFacilityClick = (facility: typeof sportsFacilities[0]) => {
//     setSelectedFacility(facility)
//   }

//  const reducers  =  { 
    
//  }

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6 text-center">Sports Facilities in Rwanda</h1>
//       <GoogleMap
//         apiKey={apiKey}
//         center={{ lat: -1.9403, lng: 29.8739 }}
//         zoom={8}
//         facilities={sportsFacilities}
//         onFacilityClick={handleFacilityClick}
//       />
//       <div className="mt-6">
//         <h2 className="text-xl font-semibold mb-2">Legend</h2>
//         <div className="flex flex-wrap gap-4">
//           <div className="flex items-center">
//             <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
//             <span>Stadium</span>
//           </div>
//           <div className="flex items-center">
//             <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
//             <span>Gym</span>
//           </div>
//           <div className="flex items-center">
//             <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
//             <span>Field</span>
//           </div>
//         </div>

//         <div class name {
//             constructor(parameters) {
//                 const field = parameters.field,
//                 const phoneNum
//             }
//         }>


//         </div>
//       </div>
//       {selectedFacility && (
//         <BookingModal
//           isOpen={!!selectedFacility}
//           onClose={() => setSelectedFacility(null)}
//           facilityName={selectedFacility.name}
//         />
//       )}
//     </div>
//   )
// }

import React, { useState } from 'react'
import GoogleMap from '../components/reusable/GoogleMap'
import BookingModal from '../components/reusable/BookingModal'

const sportsFacilities = [
  { id: '1', name: 'Amahoro National Stadium', position: { lat: -1.9441, lng: 30.0619 }, type: 'stadium' },
  { id: '2', name: 'Kigali Arena', position: { lat: -1.9530, lng: 30.0645 }, type: 'BasketBall' },
  { id: '3', name: 'Nyamirambo Regional Stadium', position: { lat: -1.9772, lng: 30.0444 }, type: 'stadium' },
  { id: '4', name: 'Kigali Golf Club', position: { lat: -1.9486, lng: 30.1128 }, type: 'field' },
  { id: '5', name: 'Cercle Sportif de Kigali', position: { lat: -1.9537, lng: 30.0652 }, type: 'gym' },
]

export default function MyMap() {
  const apiKey = "AIzaSyA_Is24-zuhqdSyUYlYqx6JGyTrG1iqaiE"
  const [selectedFacility, setSelectedFacility] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredFacilities, setFilteredFacilities] = useState(sportsFacilities)

  const handleFacilityClick = (facility) => setSelectedFacility(facility)

  const handleSearch = () => {
    setFilteredFacilities(
      sportsFacilities.filter((facility) =>
        facility.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  }

  const handleReset = () => {
    setSearchQuery('')
    setFilteredFacilities(sportsFacilities)
  }

  return (
    <div className="container mx-auto p-4 text-black">
      <h1 className="text-3xl font-bold mb-6 text-center">Sports Facilities in Rwanda</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search facilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button onClick={handleSearch} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Search
        </button>
        <button onClick={handleReset} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
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
        <div className="flex gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div> <span>Stadium</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div> <span>Gym</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div> <span>Field</span>
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
  )
}
