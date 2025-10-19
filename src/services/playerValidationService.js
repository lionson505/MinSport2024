// Mock data for frontend-only implementation
const mockPlayerDatabase = [
  {
    nationalId: '1234567890123456',
    firstName: 'Jean',
    lastName: 'Uwimana',
    dateOfBirth: '1995-03-15',
    email: 'jean.uwimana@email.com',
    phone: '+250788123456'
  },
  {
    nationalId: '9876543210987654',
    firstName: 'Marie',
    lastName: 'Mukamana',
    dateOfBirth: '1998-07-22',
    email: 'marie.mukamana@email.com',
    phone: '+250788654321'
  }
];

const mockRegistrations = [];

class PlayerValidationService {
  // Validate player data
  async validatePlayer(playerData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Basic validation
      const errors = [];
      if (!playerData.firstName) errors.push('First name is required');
      if (!playerData.lastName) errors.push('Last name is required');
      
      return {
        success: errors.length === 0,
        isValid: errors.length === 0,
        errors,
        message: errors.length === 0 ? 'Player data is valid' : 'Validation failed'
      };
    } catch (error) {
      console.error('Error validating player:', error);
      return {
        success: false,
        isValid: false,
        errors: ['Validation service unavailable'],
        message: 'Validation failed'
      };
    }
  }

  // Check for player duplication across sectors
  async checkDuplication(playerIdentifier) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { nationalId, passportNumber, season, sportDiscipline } = playerIdentifier;
      const identifier = nationalId || passportNumber;
      
      // Check existing registrations
      const existingRegistrations = mockRegistrations.filter(reg => 
        (reg.nationalId === identifier || reg.passportNumber === identifier) &&
        reg.season === season &&
        reg.sportDiscipline === sportDiscipline
      );
      
      const sectors = existingRegistrations.map(reg => reg.sector);
      const isDuplicate = sectors.length > 0;
      const canRegister = sectors.length < 2; // Max 2 sectors per season
      
      return {
        success: true,
        isDuplicate,
        canRegister,
        sectors,
        message: isDuplicate ? `Player already registered in ${sectors.join(', ')}` : 'No duplications found'
      };
    } catch (error) {
      console.error('Error checking duplication:', error);
      return {
        success: false,
        isDuplicate: false,
        canRegister: true,
        sectors: [],
        message: 'Duplication check failed'
      };
    }
  }

  // Get player details from National ID
  async getPlayerByNationalId(nationalId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const player = mockPlayerDatabase.find(p => p.nationalId === nationalId);
      
      if (player) {
        return {
          success: true,
          player,
          message: 'Player found in national database'
        };
      } else {
        return {
          success: false,
          player: null,
          message: 'Player not found in national database'
        };
      }
    } catch (error) {
      console.error('Error fetching player by National ID:', error);
      return {
        success: false,
        player: null,
        message: 'Failed to fetch player details'
      };
    }
  }

  // Check registration deadline for tournament
  async checkRegistrationDeadline(tournamentId, season) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock deadline check - assume registration is open for current season
      const currentDate = new Date();
      const deadlineDate = new Date('2025-01-10'); // Mock deadline
      const isOpen = currentDate < deadlineDate;
      
      return {
        success: true,
        isOpen,
        deadline: deadlineDate.toISOString(),
        message: isOpen ? 'Registration is open' : 'Registration deadline has passed'
      };
    } catch (error) {
      console.error('Error checking registration deadline:', error);
      return {
        success: false,
        isOpen: false,
        deadline: null,
        message: 'Failed to check registration deadline'
      };
    }
  }

  // Validate player eligibility for tournament
  async validateEligibility(playerData, tournamentData) {
    try {
      const response = await axiosInstance.post('/players/validate-eligibility', {
        player: playerData,
        tournament: tournamentData
      });
      return response.data;
    } catch (error) {
      console.error('Error validating player eligibility:', error);
      throw error;
    }
  }
}

export const playerValidationService = new PlayerValidationService();
