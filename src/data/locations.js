// File: src/data/locations.js

// Import the JSON data from location.json
import locationData from './location.json';

// Extract unique provinces, districts, sectors, cells, and villages
const provinces = [...new Set(locationData.Rwanda.map(item => item.Province.trim()))].sort();
const districts = {};
const sectors = {};
const cells = {};
const villages = {};

// Build hierarchical structure from flat data
locationData.Rwanda.forEach(item => {
  const province = item.Province.trim();
  const district = item.District.trim();
  const sector = item.Sector.trim();
  const cellule = item.Cellule.trim();
  const village = item.Village.trim();

  // Build districts by province
  if (!districts[province]) {
    districts[province] = [];
  }
  if (!districts[province].includes(district)) {
    districts[province].push(district);
  }

  // Build sectors by district
  if (!sectors[district]) {
    sectors[district] = [];
  }
  if (!sectors[district].includes(sector)) {
    sectors[district].push(sector);
  }

  // Build cells by sector
  if (!cells[sector]) {
    cells[sector] = [];
  }
  if (!cells[sector].includes(cellule)) {
    cells[sector].push(cellule);
  }

  // Build villages by cell
  if (!villages[cellule]) {
    villages[cellule] = [];
  }
  if (!villages[cellule].includes(village)) {
    villages[cellule].push(village);
  }
});

// Sort all arrays for consistency
Object.keys(districts).forEach(key => {
  districts[key].sort();
});
Object.keys(sectors).forEach(key => {
  sectors[key].sort();
});
Object.keys(cells).forEach(key => {
  cells[key].sort();
});
Object.keys(villages).forEach(key => {
  villages[key].sort();
});

export const locations = {
  provinces,
  districts,
  sectors,
  cells,
  villages,
};
