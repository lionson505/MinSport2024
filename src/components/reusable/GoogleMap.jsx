'use client'

import React, { useEffect, useRef, useState } from 'react'

const GoogleMap = ({ apiKey, center, zoom, facilities, onFacilityClick }) => {
  const mapRef = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [markers, setMarkers] = useState([])

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
          content: `<div class="p-2"><strong>${facility.name}</strong><br>${facility.type}</div>`
        })

        marker.addListener('mouseover', () => infoWindow.open(mapInstance, marker))
        marker.addListener('mouseout', () => infoWindow.close())
        marker.addListener('click', () => onFacilityClick(facility))

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
    <div 
      ref={mapRef} 
      className="w-full h-[600px] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
    />
  )
}

export default GoogleMap

