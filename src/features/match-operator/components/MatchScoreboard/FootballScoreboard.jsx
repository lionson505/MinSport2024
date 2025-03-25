import { useState, useEffect, useRef } from 'react';
import { Button } from '../../../../components/ui/Button.jsx';
import { PlayerStatsDisplay } from '../../../../components/scoreboards/PlayerStatsDisplay';
import { TeamStatsDisplay } from '../../../../components/scoreboards/TeamStatsDisplay';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../../components/ui/select";
import { Input } from '../../../../components/ui/input';
import { Timer, Users, ChevronRight, Play, Pause } from 'lucide-react';
import axiosInstance from '../../../../utils/axiosInstance';
import useFetchLiveMatches from '../../../../utils/fetchLiveMatches';
import { toast } from 'react-hot-toast';
import { usePermissionLogger } from "../../../../utils/permissionLogger.js";

function renderEvents(events, teamAPlayers, teamBPlayers) {
    return events.filter(event => {
        return event && event.team && (event.team.id || event.teamName);
    }).map(event => {
        const eventId = event.id || event.someOtherId;
        const teamId = event.team?.id || event.teamName;

        return (
            <div key={eventId}>
                <span>Event ID: {eventId}</span>
                <span>Team ID: {teamId}</span>
            </div>
        );
    });
}

export default function FootballScoreboard({ match, teamAPlayers = [], teamBPlayers = [], onUpdate, timePassed }) {
    const calculateMatchMinute = (startTime) => {
        if (!startTime) return '0';
        const start = new Date(startTime);
        const now = new Date();
        if (isNaN(start.getTime())) {
            return '0';
        }
        const diffInMinutes = Math.floor((now - start) / (1000 * 60));
        return Math.max(0, diffInMinutes).toString();
    };

    const [matchData, setMatchData] = useState({
        status: match?.status || 'NOT_STARTED',
        period: 'FIRST_HALF',
        currentTime: '00:00',
        addedTime: 0,
        teamAScore: 0,
        teamBScore: 0,
        events: []
    });

    const [showPlayerStats, setShowPlayerStats] = useState(false);
    const [showPlayerSelect, setShowPlayerSelect] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [pendingEvent, setPendingEvent] = useState(null);
    const [timerRunning, setTimerRunning] = useState(false);
    const [currentMinute, setCurrentMinute] = useState(timePassed || calculateMatchMinute(match.startTime));
    const { matches = [], liveMatchError } = useFetchLiveMatches();
    const updatedMatch = matches.filter((updatedMatch) => updatedMatch.id === match.id);

    const permissionLogger = usePermissionLogger('match');
    const [permissions, setPermissions] = useState({
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false
    });

    const [firstTime, setFirstTime] = useState(0);
    const [firstAddedTime, setFirstAddedTime] = useState(0);
    const [secondTime, setSecondTime] = useState(0);
    const [secondAddedTime, setSecondAddedTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const [showAddedTimeModal, setShowAddedTimeModal] = useState(false);
    const [showAddedLastTimeModal, setShowAddedLastTimeModal] = useState(false);
    const [addedTimeSet, setAddedTimeSet] = useState(false);
    const [addedLastTimeSet, setAddedLastTimeSet] = useState(false);
    const timerRef = useRef(null);

    const [teamBPlayersState, setTeamBPlayersState] = useState([]);
    const [teamAPlayersState, setTeamAPlayersState] = useState([]);

    const fetchPermissions = async () => {
        const currentPermissions = await permissionLogger();
        setPermissions(currentPermissions);
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    useEffect(() => {
        const fetchMatchData = async () => {
            try {
                const [matchResponse, awayTeamData] = await Promise.all([
                    axiosInstance.get(`/live-matches/${match.id}`),
                    axiosInstance.get('/away-teams')
                ]);

                const { firstTime, firstAddedTime, secondTime, secondAddedTime } = matchResponse.data;
                setFirstTime(firstTime);
                setFirstAddedTime(firstAddedTime);
                setSecondTime(secondTime);
                setSecondAddedTime(secondAddedTime);
                setTotalTime(firstTime + firstAddedTime + secondTime + secondAddedTime);

                const awayTeam = awayTeamData.data.find(team => team.teamName === match.awayTeam);

                if (awayTeam) {
                    const [goalsResponse, cardsResponse] = await Promise.all([
                        axiosInstance.get(`/live-matches/${match.id}/away-team-goals`),
                        axiosInstance.get(`/live-matches/${match.id}/away-team-cards`)
                    ]);

                    const awayTeamGoals = goalsResponse.data.filter(goal => goal.awayTeamId === awayTeam.id);
                    const awayTeamCards = cardsResponse.data.filter(card => card.awayTeamId === awayTeam.id);

                    const newEvents = [
                        ...awayTeamGoals.map(goal => ({
                            type: 'GOAL',
                            playerName: goal.playerName.trim(),
                            minute: goal.minute
                        })),
                        ...awayTeamCards.map(card => ({
                            type: card.type,
                            playerName: card.playerName.trim(),
                            minute: card.minute
                        }))
                    ];

                    setMatchData(prev => ({
                        ...prev,
                        events: [
                            ...prev.events.filter(event => 
                                !newEvents.some(newEvent => 
                                    newEvent.type === event.type &&
                                    newEvent.playerName === event.playerName &&
                                    newEvent.minute === event.minute
                                )
                            ),
                            ...newEvents
                        ],
                        teamBScore: awayTeamGoals.length
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch match data:', error);
            }
        };

        fetchMatchData();
    }, [match.id, match.awayTeam]);

    // Log the events after they have been updated
    useEffect(() => {
        console.log('Updated Match Data Events:', matchData.events);
    }, [matchData.events]);

    useEffect(() => {
        if (match.status === 'LIVE' && timerRunning) {
            const minuteInterval = setInterval(() => {
                setCurrentMinute(prevMinute => {
                    const nextMinute = parseInt(prevMinute) + 1;
                    if (nextMinute >= totalTime) {
                        clearInterval(timerRef.current);
                        setTimerRunning(false);
                        setMatchData(prev => ({ ...prev, status: 'FULL_TIME' }));
                        toast.success('Match ended');
                    }
                    return nextMinute.toString();
                });
            }, 60000); // Updates every minute
            return () => clearInterval(minuteInterval);
        }
    }, [match.startTime, match.status, timerRunning, totalTime]);

    useEffect(() => {
        const combinedEvents = [
            ...(match.goals || []),
            ...(match.cards || []),
            ...(match.substitutions || []),
            ...(match.lineups || [])
        ];
        setMatchData(prev => ({ ...prev, events: combinedEvents }));
    }, [match]);

    useEffect(() => {
        const fetchAwayTeamPlayers = async () => {
            try {
                const response = await axiosInstance.get('/away-teams');
                const awayTeamData = response.data.find(team => team.teamName === match.awayTeam);

                if (awayTeamData && awayTeamData.players) {
                    console.log(`Team name ${match.awayTeam} found in /away-teams`);
                    const playersFromApi = Object.entries(awayTeamData.players).map(([key, value]) => ({
                        id: key,
                        playerStaff: { firstName: value, lastName: '' }
                    }));
                    setTeamBPlayersState(playersFromApi);
                } else {
                    console.log(`Team name ${match.awayTeam} not found in /away-teams`);
                    setTeamBPlayersState(teamBPlayers);
                }
            } catch (error) {
                console.error('Failed to fetch away team players:', error);
                setTeamBPlayersState(teamBPlayers);
            }
        };

        if (match.awayTeam) {
            fetchAwayTeamPlayers();
        }
    }, [match.awayTeam, teamBPlayers]);

    useEffect(() => {
        // Assuming home team players are fetched differently
        setTeamAPlayersState(teamAPlayers);
    }, [teamAPlayers]);

    const handleStartMatch = async () => {
        try {
            await axiosInstance.patch(`/live-matches/${match.id}/status`, {
                status: 'ONGOING'
            });

            const startTimeIOso = new Date(Date.now()).toISOString();

            await axiosInstance.put(`/live-matches/${match.id}`, {
                startTime: startTimeIOso
            });

            await axiosInstance.patch(`/live-matches/${match.id}/first-time`, {
                firstTime: 45
            });

            setTimerRunning(true);
            setMatchData(prev => ({ ...prev, status: 'FIRST_HALF' }));
            toast.success('Match started successfully');
        } catch (error) {
            toast.error('Failed to start match');
            console.error(error);
        }
    };

    const handleEndMatch = async () => {
        try {
            await axiosInstance.patch(`/live-matches/${match.id}/status`, {
                status: 'ENDED'
            });
            setTimerRunning(false);
            setMatchData(prev => ({ ...prev, status: 'FULL_TIME' }));
            toast.success('Match ended successfully');
        } catch (error) {
            toast.error('Failed to end match');
            console.error(error);
        }
    };

    const handleHalfTime = async () => {
        try {
            await axiosInstance.patch(`/live-matches/${match.id}/status`, {
                status: 'HALFTIME'
            });

            await axiosInstance.patch(`/live-matches/${match.id}/second-time`, {
                secondTime: 45
            });

            setTimerRunning(false);
            setMatchData(prev => ({ ...prev, status: 'HALF_TIME' }));
            toast.success('Half time started');
        } catch (error) {
            toast.error('Failed to set half time');
            console.error(error);
        }
    };

    const handleSaveAddedTime = async () => {
        try {
            await axiosInstance.patch(`/live-matches/${match.id}/first-added-time`, {
                firstAddedTime: firstAddedTime
            });
            toast.success('Added first time saved successfully');
            setShowAddedTimeModal(false);
            setAddedTimeSet(true);
        } catch (error) {
            toast.error('Failed to save added first time');
            console.error(error);
        }
    };

    const handleSaveAddedLastTime = async () => {
        try {
            await axiosInstance.patch(`/live-matches/${match.id}/second-added-time`, {
                secondAddedTime: secondAddedTime
            });
            toast.success('Added last time saved successfully');
            setShowAddedLastTimeModal(false);
            setAddedLastTimeSet(true);
        } catch (error) {
            toast.error('Failed to save added last time');
            console.error(error);
        }
    };

    const addEvent = async (type, team, player) => {
        try {
            if (type === 'STATUS') {
                const statusEndpoint = `/live-matches/${match.id}/status`;
                const statusMapping = {
                    'FIRST_HALF': 'FH',
                    'HALF_TIME': 'HT',
                    'SECOND_HALF': 'SH',
                    'FULL_TIME': 'FT'
                };
                await axiosInstance.patch(statusEndpoint, { status: statusMapping[matchData.status] });
                toast.success(`Match status updated to ${matchData.status}`);
                return;
            }

            if (!player) {
                throw new Error('Player must be selected for the event.');
            }

            const playerId = player.playerStaff.id;
            const playerName = `${player.playerStaff.firstName} ${player.playerStaff.lastName}`;
            const currentMinuteInt = parseInt(currentMinute);

            if (type === 'GOAL') {
                if (team === 'A') {
                    const anotherGoal = (updatedMatch[0]?.homeScore || 0) + 1;
                    setMatchData(prev => ({ ...prev, teamAScore: anotherGoal }));
                    const scoreEndpoint = `/live-matches/${match.id}/score`;
                    await axiosInstance.patch(scoreEndpoint, { homeScore: anotherGoal });
                    const eventEndpoint = `/live-matches/${match.id}/event`;
                    const eventData = {
                        eventType: "goal",
                        eventData: {
                            nationalTeamPlayerStaffId: playerId,
                            minute: currentMinuteInt
                        }
                    };
                    await axiosInstance.post(eventEndpoint, eventData);
                    toast.success('Goal recorded successfully');
                    onUpdate?.();
                } else if (team === 'B') {
                    const awayTeamData = await axiosInstance.get('/away-teams');
                    const awayTeam = awayTeamData.data.find(team => team.teamName === match.awayTeam);

                    if (awayTeam) {
                        const goalEndpoint = `/live-matches/${match.id}/away-team-goal`;
                        const goalData = {
                            awayTeamId: awayTeam.id,
                            playerName: playerName,
                            minute: currentMinuteInt
                        };
                        await axiosInstance.post(goalEndpoint, goalData);
                        toast.success('Goal recorded successfully for away team');
                    } else {
                        const anotherGoal = (updatedMatch[0]?.awayScore || 0) + 1;
                        setMatchData(prev => ({ ...prev, teamBScore: anotherGoal }));
                        const scoreEndpoint = `/live-matches/${match.id}/score`;
                        await axiosInstance.patch(scoreEndpoint, { awayScore: anotherGoal });
                        const eventEndpoint = `/live-matches/${match.id}/event`;
                        const eventData = {
                            eventType: "goal",
                            eventData: {
                                nationalTeamPlayerStaffId: playerId,
                                minute: currentMinuteInt
                            }
                        };
                        await axiosInstance.post(eventEndpoint, eventData);
                        toast.success('Goal recorded successfully');
                        onUpdate?.();
                    }
                }
            } else if (type === 'YELLOW_CARD' || type === 'RED_CARD') {
                const cardType = type === 'YELLOW_CARD' ? 'YELLOW' : 'RED';

                if (team === 'A') {
                    const eventEndpoint = `/live-matches/${match.id}/event`;
                    const eventData = {
                        eventType: "card",
                        eventData: {
                            nationalTeamPlayerStaffId: playerId,
                            minute: 12,
                            type: cardType
                        }
                    };
                    await axiosInstance.post(eventEndpoint, eventData);
                    toast.success(`${cardType} card recorded`);
                    onUpdate?.();

                    setMatchData(prev => ({
                        ...prev,
                        events: [...prev.events, { ...eventData.eventData, type: cardType }]
                    }));
                } else if (team === 'B') {
                    const awayTeamData = await axiosInstance.get('/away-teams');
                    const awayTeam = awayTeamData.data.find(team => team.teamName === match.awayTeam);

                    if (awayTeam) {
                        const cardEndpoint = `/live-matches/${match.id}/away-team-card`;
                        const cardData = {
                            awayTeamId: awayTeam.id,
                            playerName: playerName,
                            type: cardType,
                            minute: currentMinuteInt
                        };
                        await axiosInstance.post(cardEndpoint, cardData);
                        toast.success(`${cardType} card recorded for away team`);
                    } else {
                        const eventEndpoint = `/live-matches/${match.id}/event`;
                        const eventData = {
                            eventType: "card",
                            eventData: {
                                nationalTeamPlayerStaffId: playerId,
                                minute: 12,
                                type: cardType
                            }
                        };
                        await axiosInstance.post(eventEndpoint, eventData);
                        toast.success(`${cardType} card recorded`);
                        onUpdate?.();

                        setMatchData(prev => ({
                            ...prev,
                            events: [...prev.events, { ...eventData.eventData, type: cardType }]
                        }));
                    }
                }
            }
        } catch (error) {
            console.error('Error updating:', error.response ? error.response.data : error.message);
            toast.error('Failed to record event');
        }
    };

    const handleEventWithPlayer = (type, team) => {
        setPendingEvent({ type, team });
        setShowPlayerSelect(true);
    };

    const confirmEventWithPlayer = (playerId) => {
        const players = pendingEvent.team === 'A' ? teamAPlayers : teamBPlayersState;
        const player = players.find(p => p.id === playerId);

        if (player) {
            addEvent(pendingEvent.type, pendingEvent.team, player);
        }

        setShowPlayerSelect(false);
        setPendingEvent(null);
        setSelectedPlayer(null);
    };

    if (!updatedMatch.length > 0) {
        return <div>no match id found</div>;
    }

    const renderMatchControls = () => (
        <div className="bg-white p-4 rounded-lg border mb-4">
            {permissions.canUpdate && (
                <div className="flex items-center justify-between">
                    <div className="space-x-2">
                        <Button
                            size="sm"
                            variant={matchData.status === 'NOT_STARTED' ? 'default' : 'outline'}
                            onClick={handleStartMatch}
                            disabled={firstTime !== 0}
                        >
                            Start Match
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setShowAddedTimeModal(true)}
                            disabled={firstTime === 0 || firstAddedTime !== 0}
                        >
                            Added First Time
                        </Button>
                        <Button
                            size="sm"
                            variant={matchData.status === 'HALF_TIME' ? 'default' : 'outline'}
                            onClick={handleHalfTime}
                            disabled={firstTime === 0 || secondTime !== 0}
                        >
                            Half Time
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setShowAddedLastTimeModal(true)}
                            disabled={secondTime === 0}
                        >
                            Added Second Time
                        </Button>
                        <Button
                            size="sm"
                            variant={matchData.status === 'FULL_TIME' ? 'default' : 'outline'}
                            onClick={handleEndMatch}
                            disabled={timerRunning || parseInt(currentMinute) <= 90}
                        >
                            End Match
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Added Time:</span>
                        <Input
                            type="number"
                            min="0"
                            max="15"
                            value={matchData.addedTime}
                            onChange={(e) => setMatchData(prev => ({ ...prev, addedTime: parseInt(e.target.value, 10) }))}
                            className="w-16"
                        />
                        <span className="text-sm">min</span>
                    </div>
                </div>
            )}
        </div>
    );

    const renderScoreboard = () => (
        <div className="bg-gray-50 p-6 rounded-xl mb-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                    <h3 className="font-medium mb-2">{match.homeTeam || 'Home Team'}</h3>
                    <div className="text-5xl font-bold mb-2">{updatedMatch[0]?.homeScore || 0}</div>
                </div>
                <div className="text-center">
                    <div className="text-5xl font-bold mb-2">
                        {parseInt(currentMinute) > 90 ? `90+${parseInt(currentMinute) - 90}'` : `${currentMinute}'`}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                        {matchData.status.replace(/_/g, ' ')}
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="font-medium mb-2">{match.awayTeam || 'Away Team'}</h3>
                    <div className="text-5xl font-bold mb-2">{updatedMatch[0]?.awayScore || 0}</div>
                </div>
            </div>
        </div>
    );

    const renderControls = () => (
        <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
                {permissions.canUpdate && (
                    <>
                        <h3 className="font-medium">{match.homeTeam || 'Home Team'} Controls</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => handleEventWithPlayer('GOAL', 'A')} className="w-full col-span-2">
                                ⚽ Goal
                            </Button>
                            <Button variant="destructive" onClick={() => handleEventWithPlayer('YELLOW_CARD', 'A')}>
                                🟨 Yellow Card
                            </Button>
                            <Button variant="destructive" onClick={() => handleEventWithPlayer('RED_CARD', 'A')}>
                                🟥 Red Card
                            </Button>
                        </div>
                    </>
                )}
            </div>
            <div className="space-y-4">
                {permissions.canUpdate && (
                    <>
                        <h3 className="font-medium">{match.awayTeam || 'Away Team'} Controls</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => handleEventWithPlayer('GOAL', 'B')} className="w-full col-span-2">
                                ⚽ Goal
                            </Button>
                            <Button variant="destructive" onClick={() => handleEventWithPlayer('YELLOW_CARD', 'B')}>
                                🟨 Yellow Card
                            </Button>
                            <Button variant="destructive" onClick={() => handleEventWithPlayer('RED_CARD', 'B')}>
                                🟥 Red Card
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    const EventItem = ({ event, players }) => {
        let eventType = '';
        let playerName = event.playerName || 'Unknown Player';
        let minute = event.minute !== undefined ? event.minute : 'Unknown Minute';

        if (event.type) {
            if (event.type === 'YELLOW') {
                eventType = 'Yellow Card';
            } else if (event.type === 'RED') {
                eventType = 'Red Card';
            } else if (event.type === 'GOAL') {
                eventType = 'Goal';
            } else {
                eventType = 'Card';
            }
        } else if (event.position) {
            eventType = 'Lineup';
            minute = '';
        } else if (event.liveMatchId) {
            eventType = 'Goal';
        } else {
            eventType = 'Substitution';
            minute = '';
        }

        // Check if playerName is not set and try to find it from players
        if (!event.playerName) {
            const player = players.find(p => p.playerStaff.id === event.nationalTeamPlayerStaffId);
            if (player) {
                playerName = `${player.playerStaff.firstName} ${player.playerStaff.lastName}`;
            }
        }

        return (
            <div className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                    {eventType === 'Goal' && '⚽'}
                    {eventType === 'Yellow Card' && '🟨'}
                    {eventType === 'Red Card' && '🟥'}
                    <span>
                        {eventType} - {playerName}
                    </span>
                </div>
                {minute && <span className="text-sm text-gray-500">{minute}</span>}
            </div>
        );
    };

    const renderEvents = () => {
        console.log('Current Match Data Events:', matchData.events);

        const homeTeamEvents = matchData.events.filter(event =>
            teamAPlayersState.some(player => player.playerStaff.id === event.nationalTeamPlayerStaffId)
        );
        const awayTeamEvents = matchData.events.filter(event =>
            teamBPlayersState.some(player => player.playerStaff.id === event.nationalTeamPlayerStaffId)
        );

        console.log('Home Team Events:', homeTeamEvents);
        console.log('Away Team Events:', awayTeamEvents);

        return (
            <div className="bg-white rounded-lg border">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-medium">Match Events</h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium mb-2">{match.homeTeam || 'Home Team'} Events</h4>
                        {homeTeamEvents.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                                No events recorded yet
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {homeTeamEvents.map((event, index) => (
                                    <EventItem key={index} event={event} players={teamAPlayersState} />
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">{match.awayTeam || 'Away Team'} Events</h4>
                        {awayTeamEvents.length === 0 ? (
                            <div className="text-center text-gray-500 py-4">
                                No events recorded yet
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {awayTeamEvents.map((event, index) => (
                                    <EventItem key={index} event={event} players={teamBPlayersState} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderPlayerSelect = () => (
        <Dialog open={showPlayerSelect} onOpenChange={setShowPlayerSelect}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Player</DialogTitle>
                    <DialogDescription>
                        Choose the player for this event
                    </DialogDescription>
                </DialogHeader>
                <Select value={selectedPlayer} onValueChange={(value) => confirmEventWithPlayer(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-blue-500 h-80 overflow-y-auto mt-2">
                        {pendingEvent?.team === 'A' && teamAPlayers?.map(player => (
                            <SelectItem key={player.id} value={player.id}>
                                #{player.playerStaff.id} - {player.playerStaff.lastName} {player.playerStaff.firstName}
                            </SelectItem>
                        ))}
                        {pendingEvent?.team === 'B' && teamBPlayersState?.map(player => (
                            <SelectItem key={player.id} value={player.id}>
                                #{player.playerStaff.id} - {player.playerStaff.lastName} {player.playerStaff.firstName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </DialogContent>
        </Dialog>
    );

    const renderAddedTimeModal = () => (
        <Dialog open={showAddedTimeModal} onOpenChange={setShowAddedTimeModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter Added First Time</DialogTitle>
                </DialogHeader>
                <Input
                    type="number"
                    min="0"
                    value={firstAddedTime}
                    onChange={(e) => setFirstAddedTime(parseInt(e.target.value, 10))}
                    className="w-full"
                />
                <Button onClick={handleSaveAddedTime} className="mt-4">
                    Save
                </Button>
            </DialogContent>
        </Dialog>
    );

    const renderAddedLastTimeModal = () => (
        <Dialog open={showAddedLastTimeModal} onOpenChange={setShowAddedLastTimeModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter Added Last Time</DialogTitle>
                </DialogHeader>
                <Input
                    type="number"
                    min="0"
                    value={secondAddedTime}
                    onChange={(e) => setSecondAddedTime(parseInt(e.target.value, 10))}
                    className="w-full"
                />
                <Button onClick={handleSaveAddedLastTime} className="mt-4">
                    Save
                </Button>
            </DialogContent>
        </Dialog>
    );

    // Ensure events is an array
    const events = Array.isArray(match.events) ? match.events : [];
    if (!Array.isArray(match.events)) {
        console.error("Events is not an array, defaulting to empty array");
    }

    const filteredEvents = renderEvents(events, teamAPlayers, teamBPlayersState);

    return (
        <div className="space-y-6">
            {renderMatchControls()}
            {renderScoreboard()}
            {renderControls()}
            {filteredEvents}
            {renderPlayerSelect()}
            {renderAddedTimeModal()}
            {renderAddedLastTimeModal()}
            <Dialog open={showPlayerStats} onOpenChange={setShowPlayerStats}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Player Statistics</DialogTitle>
                        <DialogDescription>
                            View detailed statistics for all players in the match.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-4">
                        <PlayerStatsDisplay
                            players={[...(teamAPlayers || []), ...(teamBPlayersState || [])]}
                            gameType="football"
                            events={matchData.events}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}