import React, { useEffect, useState } from 'react';
import { ChevronLeft, User2, Info, ListVideo, X } from 'lucide-react';
import teamALogo from './liveMatch/aprLogo.jpeg';
import teamBLogo from './liveMatch/rayonLogo.jpg';
import { useFetchNationalTeam, useFetchPlayers } from '../utils/fetchMatchAndPlayers';


// Type definitions
interface Player {
    number: number;
    name: string;
    position: string;
}

interface Team {
    name: string;
    logo?: string;
}

interface MatchEvent {
    time: string;
    type: string;
    description: string;
}

interface Match {
    id: string;
    competition: string;
    homeTeam: Team | string;
    awayTeam: Team | string;
    homeScore: number;
    awayScore: number;
    time?: string;
    venue: string;
    status: string;
    matchDate: string | Date;
    startTime: string | Date;
    events?: MatchEvent[];
    homePlayers?: Player[];
    awayPlayers?: Player[];
}

interface MatchModalProps {
    selectedMatch: Match;
    onClose: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({ selectedMatch, onClose }) => {
    const [activeTab, setActiveTab] = React.useState("Summary");
    const tabs = [
        { id: "Summary", icon: ListVideo, label: "Match Summary" },
        { id: "Info", icon: Info, label: "Match Info" },
    ];
    // Conditionally add the "Line-up" tab if the game type is football
    if (selectedMatch.gameType === 'Footballl') {
        tabs.push({ id: "Line-up", icon: User2, label: "Line-up" });
    }

    const { players = [], playersError } = useFetchPlayers([]);
    const { nationalTeam = [], nationalTeamError } = useFetchNationalTeam([]);
    const [teamAPlayers, setTeamAPlayers] = useState()
    console.log("teamAPlayers: ", teamAPlayers)
    const [teamBPlayers, setTeamBPlayers] = useState()
    const [homeTeamLineUp = [], setHomeTeamLineUp] = useState([]);
    // console.log("home team line up : ", homeTeamLineUp)
    const [awayTeamLineUp = [], setAwayTeamLineUp] = useState([]);

    // home team Players
    const nationalTeamAPlayersId = nationalTeam.filter((nationalTeam) => nationalTeam.teamName === selectedMatch.homeTeam);
    // console.log("nationalTeamAPlayersId : ", nationalTeamAPlayersId);
    const nationalTeamAPlayers = Array.isArray(players) &&
        Array.isArray(nationalTeamAPlayersId) &&
        nationalTeamAPlayersId[0] &&
        nationalTeamAPlayersId[0].id
        ? players.filter((player) => player.team && player.team.id === nationalTeamAPlayersId[0].id)
        : [];

    // Update teamAPlayers whenever nationalTeamAPlayers changes
    useEffect(() => {
        setTeamAPlayers(nationalTeamAPlayers);
    }, [nationalTeamAPlayers]);

    console.log('nationalTeamAPlayers : ', nationalTeamAPlayers);
    const positions = nationalTeamAPlayers.map((player) => player.playerStaff.positionInClub);
    // console.log('positions : ', positions);

    // away team Players
    const nationalTeamBPlayersId = nationalTeam.filter((nationalTeam) => nationalTeam.teamName === selectedMatch.awayTeam);
    const nationalTeamBPlayers = Array.isArray(players) &&
        Array.isArray(nationalTeamBPlayersId) &&
        nationalTeamBPlayersId[0] &&
        nationalTeamBPlayersId[0].id
        ? players.filter((player) => player.team && player.team.id === nationalTeamBPlayersId[0].id)
        : [];
    // console.log('nation Team B players id : ', nationalTeamBPlayers);

    useEffect(() => {
        if (selectedMatch.gameType === 'Football') {
            const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

            const homeTeamLineUp = positions.reduce((lineup, position) => {
                const key = position.charAt(0).toLowerCase() + position.slice(1);
                lineup[key] = nationalTeamAPlayers.filter(
                    player => player.playerStaff.positionInClub === position
                );
                return lineup;
            }, {});

            setHomeTeamLineUp(homeTeamLineUp);
            console.log("Foot Ball : ", nationalTeamAPlayers)



            const awayTeamLineUp = positions.reduce((lineup, position) => {
                const key = position.charAt(0).toLowerCase() + position.slice(1);
                lineup[key] = nationalTeamBPlayers.filter(
                    player => player.playerStaff.positionInClub === position
                );
                return lineup;
            }, {});

            setAwayTeamLineUp(awayTeamLineUp);

        }

        else if (selectedMatch.gameType === 'Basketball') {
            const homeTeamLineUp = {
                pointGuard: nationalTeamAPlayers.filter(nationalTeamAPlayer => nationalTeamAPlayer.playerStaff.positionInClub === 'Point Guard'),
                shootingGuard: nationalTeamAPlayers.filter(nationalTeamAPlayer => nationalTeamAPlayer.playerStaff.positionInClub === 'Shooting Guard'),
                smallForward: nationalTeamAPlayers.filter(nationalTeamAPlayer => nationalTeamAPlayer.playerStaff.positionInClub === 'Small Forward'),
                powerForward: nationalTeamAPlayers.filter(nationalTeamAPlayer => nationalTeamAPlayer.playerStaff.positionInClub === 'Power Forward'),
                center: nationalTeamAPlayers.filter(nationalTeamAPlayer => nationalTeamAPlayer.playerStaff.positionInClub === 'Center'),
                // godie 
            }
            setHomeTeamLineUp(homeTeamLineUp);
            // console.log("Foot Ball : ", nationalTeamAPlayers)

            // console.log ('home team line up: ', homeTeamLineUp);
            const awayTeamLineUp = {
                pointGuard: nationalTeamBPlayers.filter(nationalTeamBPlayer => nationalTeamBPlayer.playerStaff.positionInClub === 'Point Guard'),
                shootingGuard: nationalTeamBPlayers.filter(nationalTeamBPlayer => nationalTeamBPlayer.playerStaff.positionInClub === 'shooting Guard'),
                smallForward: nationalTeamBPlayers.filter(nationalTeamBPlayer => nationalTeamBPlayer.playerStaff.positionInClub === 'small Forward'),
                powerForward: nationalTeamBPlayers.filter(nationalTeamBPlayer => nationalTeamBPlayer.playerStaff.positionInClub === 'Power Forward'),
                center: nationalTeamBPlayers.filter(nationalTeamBPlayer => nationalTeamBPlayer.playerStaff.positionInClub === 'Center'),
            }

            setAwayTeamLineUp(awayTeamLineUp);
            // console.log ('away team line up: ', awayTeamLineUp);
        }

        else if (selectedMatch.gameType === 'Volleyball') {
            const homeTeamLineUp = {
                OutsideHitters: nationalTeamAPlayers.filter(nationalTeamAPlayer => nationalTeamAPlayer.playerStaff.positionInClub === 'GoalkeepOutsideHitters'),
                Libero: nationalTeamAPlayers.filter(nationalTeamAPlayer => nationalTeamAPlayer.playerStaff.positionInClub === 'Libero'),
                Setter: nationalTeamAPlayers.filter(nationalTeamAPlayer => nationalTeamAPlayer.playerStaff.positionInClub === 'Setter'),
                OppositeHittersLeft: nationalTeamAPlayers.filter(nationalTeamAPlayer => nationalTeamAPlayer.playerStaff.positionInClub === 'OppositeHitters'),
                MiddleBlockers: nationalTeamAPlayers.filter(nationalTeamAPlayer => nationalTeamAPlayer.playerStaff.positionInClub === 'MiddleBlockers'),
                OppositeHittersRight: nationalTeamAPlayers.filter(nationalTeamAPlayer => nationalTeamAPlayer.playerStaff.positionInClub === 'OppositeHitters'),
            }
            setHomeTeamLineUp(homeTeamLineUp);
            // console.log ('home team line up: ', homeTeamLineUp);
            const awayTeamLineUp = {
                OutsideHitters: nationalTeamBPlayers.filter(nationalTeamBPlayer => nationalTeamBPlayer.playerStaff.positionInClub === 'GoalkeepOutsideHitters'),
                Libero: nationalTeamBPlayers.filter(nationalTeamBPlayer => nationalTeamBPlayer.playerStaff.positionInClub === 'Libero'),
                Setter: nationalTeamBPlayers.filter(nationalTeamBPlayer => nationalTeamBPlayer.playerStaff.positionInClub === 'Setter'),
                OppositeHittersLeft: nationalTeamBPlayers.filter(nationalTeamBPlayer => nationalTeamBPlayer.playerStaff.positionInClub === 'OppositeHitters'),
                MiddleBlockers: nationalTeamBPlayers.filter(nationalTeamBPlayer => nationalTeamBPlayer.playerStaff.positionInClub === 'MiddleBlockers'),
                OppositeHittersRight: nationalTeamBPlayers.filter(nationalTeamBPlayer => nationalTeamBPlayer.playerStaff.positionInClub === 'OppositeHitters'),
            }
            setAwayTeamLineUp(awayTeamLineUp);
            // console.log ('away team line up: ', awayTeamLineUp);
        }

        else {
            return <div>Uknown Game Type</div>;
        }
        console.log('Teams LineUp: ', { homeTeamLineUp, awayTeamLineUp })
    }, [selectedMatch.gameType, nationalTeamAPlayers, nationalTeamBPlayers])


    if (!selectedMatch) return null;

    return (
        <div style={{
            backdropFilter: 'blur(1px)'
        }} className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-[95%] max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-300">
                {/* Enhanced Header */}
                <div className="bg-blue-800 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Competition & Time */}
                    <div className="flex items-center gap-2 mb-6 text-white/90">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                            {selectedMatch.competition}
                        </span>
                        <span className="text-sm">• {selectedMatch.time || '82`'}</span>
                    </div>

                    {/* Teams & Score */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                        {/* Home Team */}
                        <div className="flex items-center gap-4 flex-1">
                            <div className="bg-white/10 p-3 rounded-xl">
                                <img
                                    src={typeof selectedMatch.homeTeam === 'object' ? selectedMatch.homeTeam.logo : teamBLogo}
                                    alt={typeof selectedMatch.homeTeam || 'Unknown team name'}
                                    className="h-16 w-16 object-contain"
                                />
                            </div>
                            <span className="text-2xl font-bold">
                                {typeof selectedMatch.homeTeam === 'object' ? selectedMatch.homeTeam.name : selectedMatch.homeTeam}
                            </span>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-6 px-8 py-4 bg-white/10 rounded-2xl">
                            <span className="text-4xl font-bold">{selectedMatch.homeScore}</span>
                            <span className="text-2xl font-light text-white/70">-</span>
                            <span className="text-4xl font-bold">{selectedMatch.awayScore}</span>
                        </div>


                        {/* Away Team */}
                        <div className="flex flex-row md:flex-row-reverse items-center gap-4 flex-1 justify-end">
                            <span className="order-2 md:order-1 text-2xl font-bold">
                                {typeof selectedMatch.awayTeam === 'object' ? selectedMatch.awayTeam.name : selectedMatch.awayTeam}
                            </span>
                            <div className="order-1 md:order-2 bg-white/10 p-3 rounded-xl">
                                <img
                                    src={typeof selectedMatch.awayTeam === 'object' ? selectedMatch.awayTeam.logo : teamALogo}
                                    alt={typeof selectedMatch.awayTeam || 'unknown team name'}
                                    className="h-16 w-16 object-contain"
                                />
                            </div>
                        </div>




                    </div>

                    {/* Venue */}
                    <div className="mt-6 text-center text-white/80">
                        <span className="bg-white/10 px-4 py-1 rounded-full text-sm">
                            {selectedMatch.venue}
                        </span>
                    </div>
                </div>

                {/* Enhanced Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex gap-1 p-1 mx-4 mt-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200
                    ${activeTab === tab.id
                                            ? 'bg-blue-800 text-white shadow-lg'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }
                  `}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {activeTab === "Summary" && (
                        <div className="space-y-4">
                            {(selectedMatch.events || []).map((event, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <span className="bg-[#004d14] text-white px-2 py-1 rounded text-sm">
                                        {event.time}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{event.type}</span>
                                        <span className="text-gray-600">{event.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === "Info" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                                    <h3 className="font-semibold text-gray-900">Match Details</h3>
                                    {[
                                        { label: 'Status', value: selectedMatch.status },
                                        { label: 'Date', value: new Date(selectedMatch.matchDate).toLocaleDateString() },
                                        { label: 'Start Time', value: new Date(selectedMatch.startTime).toLocaleTimeString() },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                                            <span className="text-gray-600">{label}</span>
                                            <span className="font-medium">{value}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <h3 className="font-semibold text-gray-900 mb-4">Match Stats</h3>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Referee', value: 'Michael Oliver' },
                                            { label: 'Weather', value: 'Cloudy, 18°C' },
                                            { label: 'Attendance', value: '75,000' }
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex justify-between items-center">
                                                <span className="text-gray-600">{label}</span>
                                                <span className="font-medium">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "Line-up" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8  h-[400px] overflow-y-auto bg-gray-100 p-4 rounded-lg shadow-md">

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">
                                    {selectedMatch.homeTeam} Line-up
                                </h3>
                                <div className="space-y-2">
                                    {homeTeamLineUp?.goalkeeper ? (
                                        <div
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <span className='italic'>{homeTeamLineUp?.goalkeeper?.[0]?.playerStaff?.positionInClub ?? homeTeamLineUp?.pointGuard?.[0]?.playerStaff?.positionInClub}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium">
                                                    {homeTeamLineUp?.goalkeeper?.[0]?.playerStaff?.lastName}{" "}
                                                    {homeTeamLineUp?.goalkeeper?.[0]?.playerStaff?.firstName}
                                                </span>

                                                <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                    {homeTeamLineUp?.goalkeeper?.[0]?.playerStaff?.id || "N/A"}
                                                </span>

                                            </div>
                                            {/* <span className="text-sm text-gray-600">{player.position}</span> */}
                                        </div>
                                    ) : null}

                                    {Array.isArray(homeTeamLineUp?.defender) || Array.isArray(homeTeamLineUp?.pointGuard) || Array.isArray(homeTeamLineUp?.OutsideHitters)
                                        ? (homeTeamLineUp.defender || homeTeamLineUp.pointGuard || homeTeamLineUp.OutsideHitters).map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div>
                                                    <span className="italic">{player.playerStaff.positionInClub}</span>
                                                </div>

                                                <div className="flex items-center w-2/3 justify-start gap-3">
                                                    <div>
                                                        <span className="font-medium">{player.playerStaff.lastName} {player.playerStaff.firstName}</span>
                                                    </div>
                                                    <div>
                                                        <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                            {player.playerStaff.id || 'player number'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                        : ("")
                                    }


                                    {Array.isArray(homeTeamLineUp?.Midfielder) || Array.isArray(homeTeamLineUp?.shootingGuard) || Array.isArray(homeTeamLineUp?.Libero)
                                        ? (homeTeamLineUp.Midfielder || homeTeamLineUp.shootingGuard || homeTeamLineUp.Libero).map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div>
                                                    <span className='italic'>{player.playerStaff.positionInClub}</span>
                                                </div>

                                                <div className="flex items-center w-2/3 justify-start gap-3">


                                                    <div>
                                                        <span className="font-medium">{player.playerStaff.lastName} {player.playerStaff.firstName}</span>
                                                    </div>
                                                    <div>
                                                        <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                            {player.playerStaff.id || 'player number'}
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>
                                        )) : ("")
                                    }

                                    {Array.isArray(homeTeamLineUp?.Forward) || Array.isArray(homeTeamLineUp?.smallForward) || Array.isArray(homeTeamLineUp?.Setter)
                                        ? (homeTeamLineUp.Forward || homeTeamLineUp.smallForward || homeTeamLineUp.Setter).map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div>
                                                    <span className='italic'>{player.playerStaff.positionInClub}</span>
                                                </div>

                                                <div className="flex items-center w-2/3 justify-start gap-3">


                                                    <div>
                                                        <span className="font-medium">{player.playerStaff.lastName} {player.playerStaff.firstName}</span>
                                                    </div>
                                                    <div>
                                                        <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                            {player.playerStaff.id || 'player number'}
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>
                                        )) : ("")
                                    }

                                    {Array.isArray(homeTeamLineUp?.powerForward) || Array.isArray(homeTeamLineUp?.OppositeHittersLeft)
                                        ? (homeTeamLineUp.powerForward || homeTeamLineUp.OppositeHittersLeft).map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div>
                                                    <span className='italic'>{player.playerStaff.positionInClub}</span>
                                                </div>

                                                <div className="flex items-center w-2/3 justify-start gap-3">


                                                    <div>
                                                        <span className="font-medium">{player.playerStaff.lastName} {player.playerStaff.firstName}</span>
                                                    </div>
                                                    <div>
                                                        <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                            {player.playerStaff.id || 'player number'}
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>
                                        )) : ("")
                                    }


                                    {Array.isArray(homeTeamLineUp?.center) || Array.isArray(homeTeamLineUp?.MiddleBlockers)
                                        ? (homeTeamLineUp.center || homeTeamLineUp.MiddleBlockers).map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div>
                                                    <span className='italic'>{player.playerStaff.positionInClub}</span>
                                                </div>

                                                <div className="flex items-center w-2/3 justify-start gap-3">


                                                    <div>
                                                        <span className="font-medium">{player.playerStaff.lastName} {player.playerStaff.firstName}</span>
                                                    </div>
                                                    <div>
                                                        <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                            {player.playerStaff.id || 'player number'}
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>
                                        )) : ("")
                                    }

                                    {Array.isArray(homeTeamLineUp?.OppositeHittersRight)
                                        ? (homeTeamLineUp.OppositeHittersRight).map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div>
                                                    <span className='italic'>{player.playerStaff.positionInClub}</span>
                                                </div>

                                                <div className="flex items-center w-2/3 justify-start gap-3">


                                                    <div>
                                                        <span className="font-medium">{player.playerStaff.lastName} {player.playerStaff.firstName}</span>
                                                    </div>
                                                    <div>
                                                        <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                            {player.playerStaff.id || 'player number'}
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>
                                        )) : ("")
                                    }

                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg border-b pb-2">
                                    {selectedMatch.awayTeam} Line-up
                                </h3>
                                <div className="space-y-2">
                                    {awayTeamLineUp?.goalkeeper ? (
                                        <div
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <span className='italic'>{awayTeamLineUp?.goalkeeper?.[0]?.playerStaff?.positionInClub ?? awayTeamLineUp?.pointGuard?.[0]?.playerStaff?.positionInClub}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium">
                                                    {awayTeamLineUp?.goalkeeper?.[0]?.playerStaff?.lastName}{" "}
                                                    {awayTeamLineUp?.goalkeeper?.[0]?.playerStaff?.firstName}
                                                </span>

                                                <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                    {awayTeamLineUp?.goalkeeper?.[0]?.playerStaff?.id || "N/A"}
                                                </span>

                                            </div>
                                            {/* <span className="text-sm text-gray-600">{player.position}</span> */}
                                        </div>
                                    ) : null}

                                    {Array.isArray(awayTeamLineUp?.defender) || Array.isArray(awayTeamLineUp?.pointGuard) || Array.isArray(awayTeamLineUp?.OutsideHitters)
                                        ? (awayTeamLineUp.defender || awayTeamLineUp.pointGuard || awayTeamLineUp.OutsideHitters).map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div>
                                                    <span className="italic">{player.playerStaff.positionInClub}</span>
                                                </div>

                                                <div className="flex items-center w-2/3 justify-start gap-3">
                                                    <div>
                                                        <span className="font-medium">{player.playerStaff.lastName} {player.playerStaff.firstName}</span>
                                                    </div>
                                                    <div>
                                                        <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                            {player.playerStaff.id || 'player number'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                        : ("")
                                    }


                                    {Array.isArray(awayTeamLineUp?.Midfielder) || Array.isArray(awayTeamLineUp?.shootingGuard) || Array.isArray(awayTeamLineUp?.Libero)
                                        ? (awayTeamLineUp.Midfielder || awayTeamLineUp.shootingGuard || awayTeamLineUp.Libero).map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div>
                                                    <span className='italic'>{player.playerStaff.positionInClub}</span>
                                                </div>

                                                <div className="flex items-center w-2/3 justify-start gap-3">


                                                    <div>
                                                        <span className="font-medium">{player.playerStaff.lastName} {player.playerStaff.firstName}</span>
                                                    </div>
                                                    <div>
                                                        <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                            {player.playerStaff.id || 'player number'}
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>
                                        )) : ("")
                                    }

                                    {Array.isArray(awayTeamLineUp?.Forward) || Array.isArray(awayTeamLineUp?.smallForward) || Array.isArray(awayTeamLineUp?.Setter)
                                        ? (awayTeamLineUp.Forward || awayTeamLineUp.smallForward || awayTeamLineUp.Setter).map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div>
                                                    <span className='italic'>{player.playerStaff.positionInClub}</span>
                                                </div>

                                                <div className="flex items-center w-2/3 justify-start gap-3">


                                                    <div>
                                                        <span className="font-medium">{player.playerStaff.lastName} {player.playerStaff.firstName}</span>
                                                    </div>
                                                    <div>
                                                        <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                            {player.playerStaff.id || 'player number'}
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>
                                        )) : ("")
                                    }

                                    {Array.isArray(awayTeamLineUp?.powerForward) || Array.isArray(awayTeamLineUp?.OppositeHittersLeft)
                                        ? (awayTeamLineUp.powerForward || awayTeamLineUp.OppositeHittersLeft).map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div>
                                                    <span className='italic'>{player.playerStaff.positionInClub}</span>
                                                </div>

                                                <div className="flex items-center w-2/3 justify-start gap-3">


                                                    <div>
                                                        <span className="font-medium">{player.playerStaff.lastName} {player.playerStaff.firstName}</span>
                                                    </div>
                                                    <div>
                                                        <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                            {player.playerStaff.id || 'player number'}
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>
                                        )) : ("")
                                    }


                                    {Array.isArray(awayTeamLineUp?.center) || Array.isArray(awayTeamLineUp?.MiddleBlockers)
                                        ? (awayTeamLineUp.center || awayTeamLineUp.MiddleBlockers).map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div>
                                                    <span className='italic'>{player.playerStaff.positionInClub}</span>
                                                </div>

                                                <div className="flex items-center w-2/3 justify-start gap-3">


                                                    <div>
                                                        <span className="font-medium">{player.playerStaff.lastName} {player.playerStaff.firstName}</span>
                                                    </div>
                                                    <div>
                                                        <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                            {player.playerStaff.id || 'player number'}
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>
                                        )) : ("")
                                    }

                                    {Array.isArray(awayTeamLineUp?.OppositeHittersRight)
                                        ? (awayTeamLineUp.OppositeHittersRight).map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                            >
                                                <div>
                                                    <span className='italic'>{player.playerStaff.positionInClub}</span>
                                                </div>

                                                <div className="flex items-center w-2/3 justify-start gap-3">


                                                    <div>
                                                        <span className="font-medium">{player.playerStaff.lastName} {player.playerStaff.firstName}</span>
                                                    </div>
                                                    <div>
                                                        <span className="w-6 h-6 bg-blue-800 text-white rounded-full flex items-center justify-center text-sm">
                                                            {player.playerStaff.id || 'player number'}
                                                        </span>
                                                    </div>

                                                </div>
                                            </div>
                                        )) : ("")
                                    }

                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchModal;