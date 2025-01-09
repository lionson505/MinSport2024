import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";

const useFetchLiveMatches = () => {
    const [matches, setMatches] = useState([]);  // Initialize with an empty array
    // console.log("matches : ", matches)
    const [liveMatchError, setError] = useState(null);  // Initialize with null

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await axiosInstance.get('/live-matches');
                // Axios already parses the response as JSON, so you can access it directly
                setMatches(response.data);
                // console.log('Matches fetched successfully:', response.data);  // Log the fetched data
                
            } catch (err) {
                setError(err);
                console.error('Error fetching matches:', err);  
            }
        };

        fetchMatches();

        // Pulling logic to update live matches data
        const interval = setInterval(fetchMatches, 2000);
        return () => clearInterval(interval);  
    }, []);  

    return { matches, liveMatchError };  
};

export default useFetchLiveMatches;
