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
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
      }
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
          icon: getMarkerIcon(facility.type),
          title: facility.name,
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div>
              <h2>${facility.name}</h2>
              <p>${facility.description || 'No description available'}</p>
              <p>Coordinates: ${facility.position.lat}, ${facility.position.lng}</p>
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
      }
    }
  }, [mapInstance, facilities, onFacilityClick])

  const getMarkerIcon = (type) => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/'
    switch (type) {
      case 'stadium':
        return `${baseUrl}blue-dot.png`
      case 'gym':
        return `${baseUrl}green-dot.png`
      case 'field':
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

