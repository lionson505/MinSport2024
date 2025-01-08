const prisma = require('../config/database');

const getAllLiveMatches = async () => {
    return prisma.liveMatch.findMany({
        include: {
            goals: true,
            cards: true,
            substitutions: true,
            lineups: true
        }
    });
};

const getLiveMatchById = async (id) => {
    return prisma.liveMatch.findUnique({
        where: { id: parseInt(id) },
        include: {
            goals: true,
            cards: true,
            substitutions: true,
            lineups: true
        }
    });
};

const createLiveMatch = async (matchData) => {
    const { lineups, goals, cards, substitutions, createdAt, updatedAt, ...baseMatchData } = matchData;

    return prisma.liveMatch.create({
        data: {
            ...baseMatchData,
            goals: goals && goals.length > 0 ? {
                create: goals.map(goal => ({
                    playerId: goal.playerId,
                    minute: goal.minute
                }))
            } : undefined,
            cards: cards && cards.length > 0 ? {
                create: cards.map(card => ({
                    playerId: card.playerId,
                    type: card.type,
                    minute: card.minute
                }))
            } : undefined,
            substitutions: substitutions && substitutions.length > 0 ? {
                create: substitutions.map(sub => ({
                    playerIn: sub.playerIn,
                    playerOut: sub.playerOut,
                    minute: sub.minute
                }))
            } : undefined,
            lineups: lineups && lineups.length > 0 ? {
                create: lineups.map(lineup => ({
                    playerId: lineup.playerId,
                    position: lineup.position,
                    isStarting: lineup.isStarting
                }))
            } : undefined
        },
        include: {
            goals: true,
            cards: true,
            substitutions: true,
            lineups: true
        }
    });
};

const updateLiveMatch = async (id, updateData) => {
    try {
        return await prisma.liveMatch.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                goals: true,
                cards: true,
                substitutions: true,
                lineups: true
            }
        });
    } catch (error) {
        console.error('Error in liveMatchService.updateLiveMatch:', error);
        throw error;
    }
};

const updateMatchEvent = async (matchId, eventType, eventData) => {
    switch (eventType) {
        case 'goal':
            return prisma.goal.create({
                data: {
                    liveMatchId: parseInt(matchId),
                    ...eventData
                }
            });

        case 'card':
            return prisma.card.create({
                data: {
                    liveMatchId: parseInt(matchId),
                    ...eventData
                }
            });

        case 'substitution':
            return prisma.substitution.create({
                data: {
                    liveMatchId: parseInt(matchId),
                    ...eventData
                }
            });

        case 'lineup':
            return prisma.lineup.create({
                data: {
                    liveMatchId: parseInt(matchId),
                    ...eventData
                }
            });

        default:
            throw new Error('Invalid event type');
    }
};

const updateMatchScore = async (id, homeScore, awayScore) => {
    return prisma.liveMatch.update({
        where: { id: parseInt(id) },
        data: {
            homeScore,
            awayScore,
            // status: homeScore !== undefined || awayScore !== undefined ? 'ONGOING' : undefined
        }
    });
};

const updateMatchStatus = async (id, status) => {
    return prisma.liveMatch.update({
        where: { id: parseInt(id) },
        data: { status }
    });
};

// Added the missing deleteLiveMatch function
const deleteLiveMatch = async (id) => {
    return prisma.liveMatch.delete({
        where: { id: parseInt(id) }
    });
};

module.exports = {
    getAllLiveMatches,
    getLiveMatchById,
    createLiveMatch,
    updateLiveMatch,
    updateMatchEvent,
    updateMatchScore,
    updateMatchStatus,
    deleteLiveMatch
};