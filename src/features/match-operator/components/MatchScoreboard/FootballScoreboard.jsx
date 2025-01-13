import { useState, useEffect } from 'react';
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

export default function FootballScoreboard({ match, teamAPlayers = [], teamBPlayers = [], onUpdate }) {
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
    const [currentMinute, setCurrentMinute] = useState(calculateMatchMinute(match.startTime));
    const { matches = [], liveMatchError } = useFetchLiveMatches();
    const updatedMatch = matches.filter((updatedMatch) => updatedMatch.id === match.id);

    const permissionLogger = usePermissionLogger('match');
    const [permissions, setPermissions] = useState({
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false
    });

    const fetchPermissions = async () => {
        const currentPermissions = await permissionLogger();
        setPermissions(currentPermissions);
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    useEffect(() => {
        if (match.status === 'LIVE' && timerRunning) {
            const minuteInterval = setInterval(() => {
                setCurrentMinute(calculateMatchMinute(match.startTime));
            }, 60000); // Updates every minute
            return () => clearInterval(minuteInterval);
        }
    }, [match.startTime, match.status, timerRunning]);

    useEffect(() => {
        const combinedEvents = [
            ...(match.goals || []),
            ...(match.cards || []),
            ...(match.substitutions || []),
            ...(match.lineups || [])
        ];
        setMatchData(prev => ({ ...prev, events: combinedEvents }));
    }, [match]);

    const handleStartMatch = async () => {
        try {
            await axiosInstance.patch(`/live-matches/${match.id}/status`, {
                status: 'ONGOING'
            });

            const startTimeIOso = new Date(Date.now()).toISOString();

            await axiosInstance.put(`/live-matches/${match.id}`, {
                startTime: startTimeIOso
            })
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
            setTimerRunning(false);
            setMatchData(prev => ({ ...prev, status: 'HALF_TIME' }));
            toast.success('Half time started');
        } catch (error) {
            toast.error('Failed to set half time');
            console.error(error);
        }
    };

    const handleSecondHalf = async () => {
        try {
            await axiosInstance.patch(`/live-matches/${match.id}/status`, {
                status: 'HTL'
            });
            setTimerRunning(true);
            setCurrentMinute('45');
            setMatchData(prev => ({ ...prev, status: 'SECOND_HALF' }));
            toast.success('Second half started');
        } catch (error) {
            toast.error('Failed to start second half');
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
            const currentMinuteInt = parseInt(currentMinute);

            if (type === 'GOAL') {
                let updatedMatchData = {};
                if (team === 'A') {
                    const anotherGoal = (updatedMatch[0]?.homeScore || 0) + 1;
                    setMatchData(prev => ({ ...prev, teamAScore: anotherGoal }));
                    updatedMatchData = { homeScore: anotherGoal };
                } else if (team === 'B') {
                    const anotherGoal = (updatedMatch[0]?.awayScore || 0) + 1;
                    setMatchData(prev => ({ ...prev, teamBScore: anotherGoal }));
                    updatedMatchData = { awayScore: anotherGoal };
                }

                const scoreEndpoint = `/live-matches/${match.id}/score`;
                await axiosInstance.patch(scoreEndpoint, updatedMatchData);

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
            } else if (type === 'YELLOW_CARD' || type === 'RED_CARD') {
                const eventType = "card";
                const cardType = type === 'YELLOW_CARD' ? 'YELLOW' : 'RED';

                const eventEndpoint = `/live-matches/${match.id}/event`;
                const eventData = {
                    eventType: eventType,
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
        const players = pendingEvent.team === 'A' ? teamAPlayers : teamBPlayers;
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
                            disabled={matchData.status !== 'UPCOMING'}
                        >
                            Start Match
                        </Button>
                        <Button
                            size="sm"
                            variant={matchData.status === 'HALF_TIME' ? 'default' : 'outline'}
                            onClick={handleHalfTime}
                            disabled={!timerRunning || parseInt(currentMinute) <= 45}
                        >
                            Half Time
                        </Button>
                        <Button
                            size="sm"
                            variant={matchData.status === 'SECOND_HALF' ? 'default' : 'outline'}
                            onClick={handleSecondHalf}
                            disabled={matchData.status !== 'HALF_TIME'}
                        >
                            Second Half
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
        let playerName = '';
        let minute = event.minute !== undefined ? event.minute : 'Unknown Minute';

        if (event.type) {
            eventType = event.type === 'YELLOW' ? 'Yellow Card' : event.type === 'RED' ? 'Red Card' : 'Card';
        } else if (event.position) {
            eventType = 'Lineup';
            minute = '';
        } else if (event.liveMatchId) {
            eventType = 'Goal';
        } else {
            eventType = 'Substitution';
            minute = '';
        }

        const player = players.find(p => p.playerStaff.id === event.nationalTeamPlayerStaffId);
        playerName = player ? `${player.playerStaff.firstName} ${player.playerStaff.lastName}` : 'Unknown Player';

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
        const homeTeamEvents = matchData.events.filter(event =>
            teamAPlayers.some(player => player.playerStaff.id === event.nationalTeamPlayerStaffId)
        );
        const awayTeamEvents = matchData.events.filter(event =>
            teamBPlayers.some(player => player.playerStaff.id === event.nationalTeamPlayerStaffId)
        );

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
                                    <EventItem key={index} event={event} players={teamAPlayers} />
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
                                    <EventItem key={index} event={event} players={teamBPlayers} />
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
                        {pendingEvent?.team === 'B' && teamBPlayers?.map(player => (
                            <SelectItem key={player.id} value={player.id}>
                                #{player.playerStaff.id} - {player.playerStaff.lastName} {player.playerStaff.firstName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </DialogContent>
        </Dialog>
    );

    return (
        <div className="space-y-6">
            {renderMatchControls()}
            {renderScoreboard()}
            {renderControls()}
            {renderEvents()}
            {renderPlayerSelect()}
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
                            players={[...(teamAPlayers || []), ...(teamBPlayers || [])]}
                            gameType="football"
                            events={matchData.events}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}