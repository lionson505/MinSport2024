import { useState, useEffect } from 'react';
import { governmentService } from '../services/governmentService';
import { toast } from 'react-hot-toast';

export const useGovernmentStructure = () => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
    loadUniversities();
  }, []);

  // Load all provinces
  const loadProvinces = async () => {
    setLoading(true);
    try {
      const response = await governmentService.getProvinces();
      if (response.success) {
        setProvinces(response.data);
      } else {
        setError('Failed to load provinces');
        toast.error('Failed to load provinces');
      }
    } catch (err) {
      setError('Failed to load provinces');
      console.error('Error loading provinces:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load districts by province
  const loadDistricts = async (provinceId) => {
    if (!provinceId) {
      setDistricts([]);
      return;
    }

    setLoading(true);
    try {
      const response = await governmentService.getDistrictsByProvince(provinceId);
      if (response.success) {
        setDistricts(response.data);
      } else {
        setError('Failed to load districts');
        toast.error('Failed to load districts');
      }
    } catch (err) {
      setError('Failed to load districts');
      console.error('Error loading districts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load sectors by district
  const loadSectors = async (districtId) => {
    if (!districtId) {
      setSectors([]);
      return;
    }

    setLoading(true);
    try {
      const response = await governmentService.getSectorsByDistrict(districtId);
      if (response.success) {
        setSectors(response.data);
      } else {
        setError('Failed to load sectors');
        toast.error('Failed to load sectors');
      }
    } catch (err) {
      setError('Failed to load sectors');
      console.error('Error loading sectors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load all universities
  const loadUniversities = async () => {
    setLoading(true);
    try {
      const response = await governmentService.getUniversities();
      if (response.success) {
        setUniversities(response.data);
      } else {
        setError('Failed to load universities');
        toast.error('Failed to load universities');
      }
    } catch (err) {
      setError('Failed to load universities');
      console.error('Error loading universities:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get full location path
  const getLocationPath = (provinceId, districtId, sectorId) => {
    const province = provinces.find(p => p.id === provinceId);
    const district = districts.find(d => d.id === districtId);
    const sector = sectors.find(s => s.id === sectorId);

    const path = [];
    if (province) path.push(province.name);
    if (district) path.push(district.name);
    if (sector) path.push(sector.name);

    return path.join(' > ');
  };

  // Reset all dependent selections
  const resetSelections = () => {
    setDistricts([]);
    setSectors([]);
  };

  return {
    provinces,
    districts,
    sectors,
    universities,
    loading,
    error,
    loadProvinces,
    loadDistricts,
    loadSectors,
    loadUniversities,
    getLocationPath,
    resetSelections
  };
};
