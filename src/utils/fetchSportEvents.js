import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";

const useFetchSportEvents = () => {
    const [events, setEvents] = useState([]);  // Initialize with an empty array
    const [eventError, setError] = useState(null);  // Initialize with null

    useEffect(() => {
        const fetchSportEvents = async () => {
            try {
                const response = await axiosInstance.get('/sports-tourism-events');
                setEvents(response.data);
            } catch (err) {
                setError(err)
                console.error('Error fetching events:', error);
            }
        };

        fetchSportEvents();

    }, []);

return { events, eventError };

};

export default useFetchSportEvents;

 