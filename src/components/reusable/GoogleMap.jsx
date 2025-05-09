'use client'

import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'

const mapContainerStyle = {
  width: '100%',
  height: '400px',
}

const CustomGoogleMap = ({ apiKey, center, zoom, facilities = [], onFacilityClick, onMapClick }) => {
  const mapRef = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [markers, setMarkers] = useState([])
  const [selectedFacility, setSelectedFacility] = useState(null)

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      script.onload = initializeMap
    }

    const initializeMap = () => {
      if (mapRef.current && !mapInstance) {
        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'administrative',
              elementType: 'geometry',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'administrative.country',
              elementType: 'geometry',
              stylers: [{ visibility: 'on' }]
            },
            {
              featureType: 'administrative.country',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            },
            {
              featureType: 'administrative.province',
              stylers: [{ visibility: 'on' }]
            }
          ]
        })
        setMapInstance(map)

        // Add click event listener to the map
        map.addListener('click', (e) => {
          const lat = e.latLng.lat()
          const lng = e.latLng.lng()
          onMapClick({ lat, lng })
        })
      }
    }

    if (!window.google) {
      loadGoogleMapsScript()
    } else {
      initializeMap()
    }

    return () => {
      if (mapInstance) {
        // Clean up the map instance if needed
      }
    }
  }, [apiKey, center, zoom])

  useEffect(() => {
    if (mapInstance) {
      // Clear existing markers
      markers.forEach(marker => marker.setMap(null))
      setMarkers([])

      // Add new markers
      const newMarkers = facilities.map(facility => {
        const marker = new window.google.maps.Marker({
          position: facility.position,
          map: mapInstance,
          icon: getMarkerIcon(facility.type_level),
          title: facility.name,
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div>
              <h2>${facility.name}</h2>
              <p>Description: ${facility.description || 'No description available'}</p>
              <p>Coordinates: ${facility.position.lat}, ${facility.position.lng}</p>
              <p>Category ID: ${facility.infraCategoryId}</p>
              <p>Sub-Category ID: ${facility.infraSubCategoryId}</p>
              <p>Status: ${facility.status}</p>
              <p>Capacity: ${facility.capacity}</p>
              <p>Owner: ${facility.owner}</p>
              <p>Location: ${facility.location.province}, ${facility.location.district}, ${facility.location.sector}, ${facility.location.cell}, ${facility.location.village}</p>
              <p>UPI: ${facility.upi}</p>
              <p>Plot Area: ${facility.plot_area}</p>
              <p>Construction Date: ${facility.construction_date}</p>
              <p>Main Users: ${facility.main_users}</p>
              <p>Types of Sports: ${facility.types_of_sports}</p>
              <p>Internet Connection: ${facility.internet_connection ? 'Yes' : 'No'}</p>
              <p>Electricity Connection: ${facility.electricity_connection ? 'Yes' : 'No'}</p>
              <p>Water Connection: ${facility.water_connection ? 'Yes' : 'No'}</p>
              <p>Access Road: ${facility.access_road ? 'Yes' : 'No'}</p>
              <p>Health Facility: ${facility.health_facility ? 'Yes' : 'No'}</p>
              <p>Legal Representative: ${facility.legal_representative.name} (${facility.legal_representative.gender})</p>
              <p>Email: ${facility.legal_representative.email}</p>
              <p>Phone: ${facility.legal_representative.phone}</p>
            </div>
          `,
        })

        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker)
          onFacilityClick(facility)
        })

        return marker
      })

      setMarkers(newMarkers)

      // Adjust map bounds to fit all markers
      if (newMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        newMarkers.forEach(marker => bounds.extend(marker.getPosition()))
        mapInstance.fitBounds(bounds)

        // Set a minimum zoom level to prevent zooming out too much
        const listener = window.google.maps.event.addListener(mapInstance, "idle", () => {
          if (mapInstance.getZoom() > 3) mapInstance.setZoom(3)
          window.google.maps.event.removeListener(listener)
        })
      }
    }
  }, [mapInstance, facilities, onFacilityClick])

  const getMarkerIcon = (typeLevel) => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/'
    switch (typeLevel) {
      case 'Sector':
        return `${baseUrl}blue-dot.png`
      case 'District':
        return `${baseUrl}green-dot.png`
      case 'Province':
        return `${baseUrl}yellow-dot.png`
      default:
        return `${baseUrl}red-dot.png`
    }
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <div 
        ref={mapRef} 
        className="w-full h-[600px] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          onClick={onMapClick}
        >
          {facilities.map((facility) => (
            <Marker
              key={facility.id}
              position={facility.position}
              onClick={() => setSelectedFacility(facility)}
            />
          ))}

          {selectedFacility && (
            <InfoWindow
              position={selectedFacility.position}
              onCloseClick={() => setSelectedFacility(null)}
            >
              <div>
                <h2>{selectedFacility.name}</h2>
                <p>{selectedFacility.description}</p>
                <p>Coordinates: {selectedFacility.position.lat}, {selectedFacility.position.lng}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </LoadScript>
  )
}

CustomGoogleMap.propTypes = {
  apiKey: PropTypes.string.isRequired,
  center: PropTypes.object.isRequired,
  zoom: PropTypes.number.isRequired,
  facilities: PropTypes.array,
  onFacilityClick: PropTypes.func.isRequired,
  onMapClick: PropTypes.func.isRequired,
}

export default CustomGoogleMap

