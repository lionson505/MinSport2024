// File: src/data/locations.js

// Import the JSON data
import locData from './loc.json';

// Extract the necessary information from the JSON data
const provinces = locData.items.map(item => item.name);
const districts = {};
const sectors = {};
const cells = {};
const villages = {};

locData.items.forEach(province => {
  districts[province.name] = province.districts.map(district => district.name);
  province.districts.forEach(district => {
    sectors[district.name] = district.sectors.map(sector => sector.name);
    district.sectors.forEach(sector => {
      cells[sector.name] = sector.cells.map(cell => cell.name);
      sector.cells.forEach(cell => {
        villages[cell.name] = cell.villages;
      });
    });
  });
});

export const locations = {
  provinces,
  districts,
  sectors,
  cells,
  villages,
};
