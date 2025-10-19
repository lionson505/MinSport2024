import { useState } from 'react';
import { playerValidationService } from '../services/playerValidationService';
import { toast } from 'react-hot-toast';

export const usePlayerValidation = () => {
  const [loading, setLoading] = useState(false);
  const [validationResults, setValidationResults] = useState(null);

  // Validate player data
  const validatePlayer = async (playerData) => {
    setLoading(true);
    try {
      const response = await playerValidationService.validatePlayer(playerData);
      setValidationResults(response);
      return response;
    } catch (err) {
      toast.error('Validation failed');
      console.error('Error validating player:', err);
      return { isValid: false, errors: ['Validation service unavailable'] };
    } finally {
      setLoading(false);
    }
  };

  // Check for player duplication across sectors
  const checkDuplication = async (playerIdentifier) => {
    setLoading(true);
    try {
      const response = await playerValidationService.checkDuplication(playerIdentifier);
      
      if (response.isDuplicate) {
        const sectorCount = response.sectors.length;
        if (sectorCount >= 2) {
          toast.error(`Player is already registered in ${sectorCount} sectors. Maximum limit reached.`);
        } else {
          toast.warning(`Player is already registered in ${response.sectors.join(', ')}`);
        }
      }
      
      return response;
    } catch (err) {
      toast.error('Duplication check failed');
      console.error('Error checking duplication:', err);
      return { isDuplicate: false, sectors: [] };
    } finally {
      setLoading(false);
    }
  };

  // Validate National ID format
  const validateNationalId = (nationalId) => {
    if (!nationalId) return { isValid: false, message: 'National ID is required' };
    
    // Rwanda National ID format: 16 digits
    const nationalIdRegex = /^\d{16}$/;
    
    if (!nationalIdRegex.test(nationalId)) {
      return { 
        isValid: false, 
        message: 'National ID must be exactly 16 digits' 
      };
    }

    // Additional validation for birth year (first 4 digits)
    const birthYear = parseInt(nationalId.substring(0, 4));
    const currentYear = new Date().getFullYear();
    
    if (birthYear < 1900 || birthYear > currentYear) {
      return { 
        isValid: false, 
        message: 'Invalid birth year in National ID' 
      };
    }

    return { isValid: true, message: 'Valid National ID format' };
  };

  // Validate passport number format
  const validatePassportNumber = (passportNumber) => {
    if (!passportNumber) return { isValid: false, message: 'Passport number is required' };
    
    // Basic passport validation (alphanumeric, 6-12 characters)
    const passportRegex = /^[A-Z0-9]{6,12}$/;
    
    if (!passportRegex.test(passportNumber.toUpperCase())) {
      return { 
        isValid: false, 
        message: 'Passport number must be 6-12 alphanumeric characters' 
      };
    }

    return { isValid: true, message: 'Valid passport number format' };
  };

  // Check tournament registration deadline
  const checkRegistrationDeadline = async (tournamentId, season) => {
    setLoading(true);
    try {
      const response = await playerValidationService.checkRegistrationDeadline(tournamentId, season);
      
      if (!response.isOpen) {
        toast.error(`Registration deadline has passed. Deadline was: ${response.deadline}`);
      }
      
      return response;
    } catch (err) {
      toast.error('Failed to check registration deadline');
      console.error('Error checking deadline:', err);
      return { isOpen: false, deadline: null };
    } finally {
      setLoading(false);
    }
  };

  // Validate player age for tournament
  const validatePlayerAge = (dateOfBirth, tournamentType) => {
    if (!dateOfBirth) return { isValid: false, message: 'Date of birth is required' };
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    // Adjust age if birthday hasn't occurred this year
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Age requirements by tournament type
    const ageRequirements = {
      umurenge_kagame: { min: 16, max: 35 },
      inter_universities: { min: 18, max: 30 }
    };

    const requirement = ageRequirements[tournamentType];
    if (!requirement) {
      return { isValid: true, message: 'No age restrictions' };
    }

    if (age < requirement.min) {
      return { 
        isValid: false, 
        message: `Player must be at least ${requirement.min} years old for this tournament` 
      };
    }

    if (age > requirement.max) {
      return { 
        isValid: false, 
        message: `Player must be under ${requirement.max} years old for this tournament` 
      };
    }

    return { isValid: true, message: 'Age requirement met' };
  };

  // Validate file uploads
  const validateFileUpload = (file, fileType) => {
    if (!file) return { isValid: true, message: 'File is optional' };

    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        message: 'File size must be less than 5MB' 
      };
    }

    const allowedTypes = {
      document: ['application/pdf'],
      photo: ['image/png', 'image/jpeg', 'image/jpg']
    };

    const allowed = allowedTypes[fileType];
    if (allowed && !allowed.includes(file.type)) {
      return { 
        isValid: false, 
        message: `Invalid file type. Allowed: ${allowed.join(', ')}` 
      };
    }

    return { isValid: true, message: 'File is valid' };
  };

  // Comprehensive form validation
  const validateRegistrationForm = async (formData) => {
    const errors = {};
    
    // Basic required fields
    if (!formData.tournamentType) errors.tournamentType = 'Tournament type is required';
    if (!formData.season) errors.season = 'Season is required';
    if (!formData.province) errors.province = 'Province is required';
    if (!formData.district) errors.district = 'District is required';
    if (!formData.sector) errors.sector = 'Sector is required';
    
    // Player type specific validation
    if (formData.playerType === 'local') {
      const nationalIdValidation = validateNationalId(formData.nationalId);
      if (!nationalIdValidation.isValid) {
        errors.nationalId = nationalIdValidation.message;
      }
    } else if (formData.playerType === 'foreign') {
      const passportValidation = validatePassportNumber(formData.passportNumber);
      if (!passportValidation.isValid) {
        errors.passportNumber = passportValidation.message;
      }
    }

    // Age validation
    if (formData.dateOfBirth) {
      const ageValidation = validatePlayerAge(formData.dateOfBirth, formData.tournamentType);
      if (!ageValidation.isValid) {
        errors.dateOfBirth = ageValidation.message;
      }
    }

    // University specific validation
    if (formData.tournamentType === 'inter_universities') {
      if (!formData.university) errors.university = 'University is required';
      if (!formData.studentId) errors.studentId = 'Student ID is required';
    }

    // File validation
    if (formData.documentFile) {
      const docValidation = validateFileUpload(formData.documentFile, 'document');
      if (!docValidation.isValid) {
        errors.documentFile = docValidation.message;
      }
    }

    if (formData.photoFile) {
      const photoValidation = validateFileUpload(formData.photoFile, 'photo');
      if (!photoValidation.isValid) {
        errors.photoFile = photoValidation.message;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  return {
    loading,
    validationResults,
    validatePlayer,
    checkDuplication,
    validateNationalId,
    validatePassportNumber,
    checkRegistrationDeadline,
    validatePlayerAge,
    validateFileUpload,
    validateRegistrationForm
  };
};
