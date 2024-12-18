import axios from 'axios';

const API_URL = 'https://your-api-endpoint.com/voting'; // Replace with your actual API URL

// Fetch all voting records
export const fetchVotingRecords = async () => {
  try {
    const response = await axios.get(`${API_URL}/records`);
    return response.data;
  } catch (error) {
    console.error('Error fetching voting records:', error);
    throw error;
  }
};

// Delete a voting record
export const deleteVotingRecord = async (votingId) => {
  try {
    const response = await axios.delete(`${API_URL}/records/${votingId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting voting record:', error);
    throw error;
  }
};

// Fetch a specific voting session by ID
export const fetchVotingDetails = async (votingId) => {
  try {
    const response = await axios.get(`${API_URL}/records/${votingId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching voting details:', error);
    throw error;
  }
};

// Record a vote for a candidate
export const recordVote = async (votingId, candidateId, criteriaId, points) => {
  try {
    const response = await axios.post(`${API_URL}/records/${votingId}/votes`, {
      candidateId,
      criteriaId,
      points,
    });
    return response.data;
  } catch (error) {
    console.error('Error recording vote:', error);
    throw error;
  }
};
