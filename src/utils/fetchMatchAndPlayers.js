import React,{useState, useEffect} from "react";
import axiosInstance from "./axiosInstance";

export const useFetchPlayers = () => {
    const [ players, setPlayers ] = useState ([])
    const [ playersError, setError ] = useState (null)

    useEffect(() => {

        const fetchPlayers = async () => {
        try {
            const response = await axiosInstance.get('/national-team-player-staff')
            setPlayers(response.data)
            // console.log('players fetched successfully!');
        }
        catch(err) {
            setError(err);
            console.error('Error in fetching Players');
        }
    };
    fetchPlayers();

    // fetch players for each 5sec 
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval)
    }, []);

    return { players, playersError };
};

export const useFetchNationalTeam = () => {
    const [ nationalTeam, setNationalTeams ] = useState ([])
    const [ nationalTeamError, setError ] = useState (null)

    useEffect(() => {
     

    const fetchNationalTeams = async() => {
        try {
            const response = await axiosInstance.get('/national-teams');
            setNationalTeams(response.data)
            // console.log('National teams fetched successuflly');
        }
        catch(err) {
            setError(err);
            console.error('Error in fetching National teams ');
        }
    };   

    fetchNationalTeams();

    // set interval to update national team each 5second
    const interval = setInterval(fetchNationalTeams, 5000);
    return () => clearInterval(interval);
}, [])

 return { nationalTeam, nationalTeamError };

}