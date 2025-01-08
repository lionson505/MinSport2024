// const liveMatchService = require('../services/liveMatchService');

// const getAllLiveMatches = async (req, res) => {
//   try {
//     const liveMatches = await liveMatchService.getAllLiveMatches();
//     res.json(liveMatches);
//   } catch (error) {
//     console.error('Error in getAllLiveMatches:', error);
//     res.status(500).json({ error: 'An error occurred while fetching live matches' });
//   }
// };

// const getLiveMatchById = async (req, res) => {
//   try {
//     const liveMatch = await liveMatchService.getLiveMatchById(req.params.id);
//     if (liveMatch) {
//       res.json(liveMatch);
//     } else {
//       res.status(404).json({ error: 'Live match not found' });
//     }
//   } catch (error) {
//     console.error('Error in getLiveMatchById:', error);
//     res.status(500).json({ error: 'An error occurred while fetching the live match' });
//   }
// };

// const createLiveMatch = async (req, res) => {
//   try {
//     // Validate required fields
//     const { homeTeam, awayTeam, competition, venue, matchDate, startTime, gameType } = req.body;

//     if (!homeTeam || !awayTeam || !competition || !venue || !matchDate || !startTime || !gameType) {
//       return res.status(400).json({
//         error: 'Missing required fields',
//         requiredFields: [
//           'homeTeam', 'awayTeam', 'competition',
//           'venue', 'matchDate', 'startTime', 'gameType'
//         ]
//       });
//     }

//     const newLiveMatch = await liveMatchService.createLiveMatch(req.body);
//     res.status(201).json(newLiveMatch);
//   } catch (error) {
//     console.error('Error in createLiveMatch:', error);
//     res.status(400).json({
//       error: 'An error occurred while creating the live match',
//       details: error.message
//     });
//   }
// };

// const updateLiveMatch = async (req, res) => {
//   try {
//     const matchId = req.params.id;
//     const updateData = req.body;

//     const updatedLiveMatch = await liveMatchService.updateLiveMatch(matchId, updateData);

//     if (!updatedLiveMatch) {
//       return res.status(404).json({ error: 'Live match not found' });
//     }

//     res.json(updatedLiveMatch);
//   } catch (error) {
//     console.error('Error in updateLiveMatch:', error);
//     res.status(400).json({
//       error: 'An error occurred while updating the live match',
//       details: error.message
//     });
//   }
// };

// const updateMatchEvent = async (req, res) => {
//   try {
//     const matchId = req.params.id;
//     const { eventType, eventData } = req.body;

//     // Validate event type and data
//     const validEventTypes = ['goal', 'card', 'substitution', 'lineup'];
//     if (!eventType || !validEventTypes.includes(eventType)) {
//       return res.status(400).json({
//         error: 'Invalid event type',
//         validTypes: validEventTypes
//       });
//     }

//     if (!eventData) {
//       return res.status(400).json({ error: 'Event data is required' });
//     }

//     const updatedEvent = await liveMatchService.updateMatchEvent(
//       matchId,
//       eventType,
//       eventData
//     );
//     res.json(updatedEvent);
//   } catch (error) {
//     console.error('Error in updateMatchEvent:', error);
//     res.status(400).json({
//       error: 'An error occurred while updating match event',
//       details: error.message
//     });
//   }
// };

// const updateMatchScore = async (req, res) => {
//   try {
//     const { homeScore, awayScore } = req.body;

//     // Validate score inputs
//     if (homeScore === undefined && awayScore === undefined) {
//       return res.status(400).json({
//         error: 'At least one score (homeScore or awayScore) must be provided'
//       });
//     }

//     if ((homeScore !== undefined && !Number.isInteger(homeScore)) ||
//         (awayScore !== undefined && !Number.isInteger(awayScore))) {
//       return res.status(400).json({
//         error: 'Scores must be integers',
//         details: 'homeScore and awayScore must be whole numbers'
//       });
//     }

//     const updatedLiveMatch = await liveMatchService.updateMatchScore(
//       req.params.id,
//       homeScore,
//       awayScore
//     );
//     res.json(updatedLiveMatch);
//   } catch (error) {
//     console.error('Error in updateMatchScore:', error);
//     res.status(400).json({
//       error: 'An error occurred while updating the match score',
//       details: error.message
//     });
//   }
// };

// const updateMatchStatus = async (req, res) => {
//   try {
//     const { status } = req.body;


//     const updatedLiveMatch = await liveMatchService.updateMatchStatus(
//       req.params.id,
//       status
//     );
//     res.json(updatedLiveMatch);
//   } catch (error) {
//     console.error('Error in updateMatchStatus:', error);
//     res.status(400).json({
//       error: 'An error occurred while updating match status',
//       details: error.message
//     });
//   }
// };

// const deleteLiveMatch = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedMatch = await liveMatchService.deleteLiveMatch(id);

//     if (!deletedMatch) {
//       return res.status(404).json({ message: 'Live match not found' });
//     }

//     return res.status(200).json({
//       message: 'Live match deleted successfully',
//       deletedMatch
//     });
//   } catch (error) {
//     console.error('Error in deleteLiveMatch:', error);

//     // Handle Prisma's specific not found error
//     if (error.code === 'P2025') {
//       return res.status(404).json({ message: 'Live match not found' });
//     }

//     return res.status(500).json({
//       message: 'An error occurred while deleting the live match',
//       details: error.message
//     });
//   }
// };

// module.exports = {
//   getAllLiveMatches,
//   getLiveMatchById,
//   createLiveMatch,
//   updateLiveMatch,
//   updateMatchEvent,
//   updateMatchScore,
//   updateMatchStatus,
//   deleteLiveMatch
// };

const liveMatchService = require('../services/liveMatchService');

const getAllLiveMatches = async (req, res) => {
  try {
    const liveMatches = await liveMatchService.getAllLiveMatches();
    res.json(liveMatches);
  } catch (error) {
    console.error('Error in getAllLiveMatches:', error);
    res.status(500).json({ error: 'An error occurred while fetching live matches' });
  }
};

const getLiveMatchById = async (req, res) => {
  try {
    const liveMatch = await liveMatchService.getLiveMatchById(req.params.id);
    if (liveMatch) {
      res.json(liveMatch);
    } else {
      res.status(404).json({ error: 'Live match not found' });
    }
  } catch (error) {
    console.error('Error in getLiveMatchById:', error);
    res.status(500).json({ error: 'An error occurred while fetching the live match' });
  }
};

const createLiveMatch = async (req, res) => {
  try {
    // Validate required fields
    const { homeTeam, awayTeam, competition, venue, matchDate, startTime, gameType } = req.body;

    if (!homeTeam || !awayTeam || !competition || !venue || !matchDate || !startTime || !gameType) {
      return res.status(400).json({
        error: 'Missing required fields',
        requiredFields: [
          'homeTeam', 'awayTeam', 'competition',
          'venue', 'matchDate', 'startTime', 'gameType'
        ]
      });
    }

    const newLiveMatch = await liveMatchService.createLiveMatch(req.body);
    res.status(201).json(newLiveMatch);
  } catch (error) {
    console.error('Error in createLiveMatch:', error);
    res.status(400).json({
      error: 'An error occurred while creating the live match',
      details: error.message
    });
  }
};

const updateLiveMatch = async (req, res) => {
  try {
    const matchId = req.params.id;
    const updateData = req.body;

    const updatedLiveMatch = await liveMatchService.updateLiveMatch(matchId, updateData);

    if (!updatedLiveMatch) {
      return res.status(404).json({ error: 'Live match not found' });
    }

    res.json(updatedLiveMatch);
  } catch (error) {
    console.error('Error in updateLiveMatch:', error);
    res.status(400).json({
      error: 'An error occurred while updating the live match',
      details: error.message
    });
  }
};

const updateMatchEvent = async (req, res) => {
  try {
    const matchId = req.params.id;
    const { eventType, eventData } = req.body;

    // Validate event type and data
    const validEventTypes = ['goal', 'card', 'substitution', 'lineup'];
    if (!eventType || !validEventTypes.includes(eventType)) {
      return res.status(400).json({
        error: 'Invalid event type',
        validTypes: validEventTypes
      });
    }

    if (!eventData) {
      return res.status(400).json({ error: 'Event data is required' });
    }

    const updatedEvent = await liveMatchService.updateMatchEvent(
      matchId,
      eventType,
      eventData
    );
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error in updateMatchEvent:', error);
    res.status(400).json({
      error: 'An error occurred while updating match event',
      details: error.message
    });
  }
};

const updateMatchScore = async (req, res) => {
  try {
    const { homeScore, awayScore } = req.body;

    // Validate score inputs
    if (homeScore === undefined && awayScore === undefined) {
      return res.status(400).json({
        error: 'At least one score (homeScore or awayScore) must be provided'
      });
    }

    if ((homeScore !== undefined && !Number.isInteger(homeScore)) ||
        (awayScore !== undefined && !Number.isInteger(awayScore))) {
      return res.status(400).json({
        error: 'Scores must be integers',
        details: 'homeScore and awayScore must be whole numbers'
      });
    }

    const updatedLiveMatch = await liveMatchService.updateMatchScore(
      req.params.id,
      homeScore,
      awayScore
    );
    res.json(updatedLiveMatch);
  } catch (error) {
    console.error('Error in updateMatchScore:', error);
    res.status(400).json({
      error: 'An error occurred while updating the match score',
      details: error.message
    });
  }
};

const updateMatchStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['NOT_STARTED', 'ONGOING', 'HALFTIME', 'ENDED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid match status',
        validStatuses: validStatuses
      });
    }

    const updatedLiveMatch = await liveMatchService.updateMatchStatus(
      req.params.id,
      status
    );
    res.json(updatedLiveMatch);
  } catch (error) {
    console.error('Error in updateMatchStatus:', error);
    res.status(400).json({
      error: 'An error occurred while updating match status',
      details: error.message
    });
  }
};

const deleteLiveMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedMatch = await liveMatchService.deleteLiveMatch(id);

    if (!deletedMatch) {
      return res.status(404).json({ message: 'Live match not found' });
    }

    return res.status(200).json({
      message: 'Live match deleted successfully',
      deletedMatch
    });
  } catch (error) {
    console.error('Error in deleteLiveMatch:', error);

    // Handle Prisma's specific not found error
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Live match not found' });
    }

    return res.status(500).json({
      message: 'An error occurred while deleting the live match',
      details: error.message
    });
  }
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