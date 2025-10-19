// Mock data for frontend-only implementation
const mockProvinces = [
  { id: 'kigali', name: 'Kigali City' },
  { id: 'northern', name: 'Northern Province' },
  { id: 'southern', name: 'Southern Province' },
  { id: 'eastern', name: 'Eastern Province' },
  { id: 'western', name: 'Western Province' }
];

const mockDistricts = {
  kigali: [
    { id: 'gasabo', name: 'Gasabo', provinceId: 'kigali' },
    { id: 'kicukiro', name: 'Kicukiro', provinceId: 'kigali' },
    { id: 'nyarugenge', name: 'Nyarugenge', provinceId: 'kigali' }
  ],
  northern: [
    { id: 'musanze', name: 'Musanze', provinceId: 'northern' },
    { id: 'burera', name: 'Burera', provinceId: 'northern' },
    { id: 'gicumbi', name: 'Gicumbi', provinceId: 'northern' }
  ],
  southern: [
    { id: 'huye', name: 'Huye', provinceId: 'southern' },
    { id: 'muhanga', name: 'Muhanga', provinceId: 'southern' },
    { id: 'nyanza', name: 'Nyanza', provinceId: 'southern' }
  ]
};

const mockSectors = {
  gasabo: [
    { id: 'kacyiru', name: 'Kacyiru', districtId: 'gasabo' },
    { id: 'kimihurura', name: 'Kimihurura', districtId: 'gasabo' },
    { id: 'remera', name: 'Remera', districtId: 'gasabo' }
  ],
  kicukiro: [
    { id: 'niboye', name: 'Niboye', districtId: 'kicukiro' },
    { id: 'kicukiro', name: 'Kicukiro', districtId: 'kicukiro' }
  ]
};

const mockUniversities = [
  { id: 'ur', name: 'University of Rwanda' },
  { id: 'kist', name: 'Kigali Institute of Science and Technology' },
  { id: 'ines', name: 'Institut d\'Enseignement Supérieur de Ruhengeri' },
  { id: 'uek', name: 'Université Evangélique au Rwanda' },
  { id: 'ub', name: 'Université du Burundi' }
];

class GovernmentService {
  // Get all provinces
  async getProvinces() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        data: mockProvinces,
        message: 'Provinces fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to fetch provinces'
      };
    }
  }

  // Get districts by province
  async getDistrictsByProvince(provinceId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const districts = mockDistricts[provinceId] || [];
      return {
        success: true,
        data: districts,
        message: 'Districts fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching districts:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to fetch districts'
      };
    }
  }

  // Get sectors by district
  async getSectorsByDistrict(districtId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const sectors = mockSectors[districtId] || [];
      return {
        success: true,
        data: sectors,
        message: 'Sectors fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching sectors:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to fetch sectors'
      };
    }
  }

  // Get all universities
  async getUniversities() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        data: mockUniversities,
        message: 'Universities fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching universities:', error);
      return {
        success: false,
        data: [],
        message: 'Failed to fetch universities'
      };
    }
  }

  // Get complete government structure
  async getCompleteStructure() {
    try {
      const response = await axiosInstance.get('/government/structure');
      return response.data;
    } catch (error) {
      console.error('Error fetching government structure:', error);
      throw error;
    }
  }
}

export const governmentService = new GovernmentService();
