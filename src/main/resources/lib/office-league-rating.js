var eloRating = require('/lib/elo-rating');

exports.INITIAL_RATING = 1500;
var K_FACTOR = 40;

/**
 * @typedef {Object} Scores
 * @property {number} redScore Score for red side.
 * @property {number} blueScore Score for blue side.
 */

/**
 * Calculates rating deltas for game and players and teams involved.
 * @param  {Game} game Game.
 * @param  {LeaguePlayer[]} leaguePlayers League players in the game.
 * @param  {LeagueTeam[]} [leagueTeams] League teams in the game.
 */
exports.calculateGameRatings = function (game, leaguePlayers, leagueTeams) {
    var scores = calculateGameScores(game);

    // team and player lookup table by side
    var playerSides = {};
    var teamSides = {};
    var i, gamePlayer, gameTeam;
    for (i = 0; i < game.gamePlayers.length; i++) {
        gamePlayer = game.gamePlayers[i];
        playerSides[gamePlayer.playerId] = gamePlayer.side;
    }
    for (i = 0; i < game.gameTeams.length; i++) {
        gameTeam = game.gameTeams[i];
        teamSides[gameTeam.teamId] = gameTeam.side;
    }

    // get team and player effective ratings (average player ratings if 2-vs-2)
    var playerTotalRating = {
        red: 0,
        blue: 0
    };
    var teamTotalRating = {
        red: 0,
        blue: 0
    };
    var leaguePlayer, leagueTeam;
    for (i = 0; i < leaguePlayers.length; i++) {
        leaguePlayer = leaguePlayers[i];
        playerTotalRating[playerSides[leaguePlayer.playerId]] += leaguePlayer.rating;
    }
    playerTotalRating.red = playerTotalRating.red / (leaguePlayers.length / 2);
    playerTotalRating.blue = playerTotalRating.blue / (leaguePlayers.length / 2);
    for (i = 0; i < leagueTeams.length; i++) {
        leagueTeam = leagueTeams[i];
        teamTotalRating[teamSides[leagueTeam.teamId]] = leagueTeam.rating;
    }

    // calculate rating deltas for players
    var playerDelta = {
        red: eloRating.calculateNewRatingDelta(playerTotalRating.red, playerTotalRating.blue, scores.redScore, K_FACTOR),
        blue: eloRating.calculateNewRatingDelta(playerTotalRating.blue, playerTotalRating.red, scores.blueScore, K_FACTOR)
    };

    // calculate rating deltas for teams
    var teamDelta = {
        red: eloRating.calculateNewRatingDelta(teamTotalRating.red, teamTotalRating.blue, scores.redScore, K_FACTOR),
        blue: eloRating.calculateNewRatingDelta(teamTotalRating.blue, teamTotalRating.red, scores.blueScore, K_FACTOR)
    };

    // update game player ratings
    for (i = 0; i < game.gamePlayers.length; i++) {
        gamePlayer = game.gamePlayers[i];
        gamePlayer.ratingDelta = playerDelta[gamePlayer.side];
    }
    // update game team ratings
    for (i = 0; i < game.gameTeams.length; i++) {
        gameTeam = game.gameTeams[i];
        gameTeam.ratingDelta = teamDelta[gameTeam.side];
    }

    // update league player ratings
    for (i = 0; i < leaguePlayers.length; i++) {
        leaguePlayer = leaguePlayers[i];
        leaguePlayer.rating += playerDelta[playerSides[leaguePlayer.playerId]];
    }
    // update league team ratings
    for (i = 0; i < leagueTeams.length; i++) {
        leagueTeam = leagueTeams[i];
        leagueTeam.rating += teamDelta[teamSides[leagueTeam.teamId]];
    }
};

/**
 * Calculate the game score probabilities [0-1] based on the result of the game.
 * @param  {Game} game Game.
 * @return {Scores} Score values for each side, between 0 and 1.
 */
var calculateGameScores = function (game) {
    var sidePoints = {
        red: 0,
        blue: 0
    };
    var i, gamePlayer;
    for (i = 0; i < game.gamePlayers.length; i++) {
        gamePlayer = game.gamePlayers[i];
        if (gamePlayer.side === 'red') {
            sidePoints.red += gamePlayer.score;
            sidePoints.blue += gamePlayer.scoreAgainst;
        } else if (gamePlayer.side === 'blue') {
            sidePoints.blue += gamePlayer.score;
            sidePoints.red += gamePlayer.scoreAgainst;
        }
    }

    var winnerPoints = Math.max(sidePoints.red, sidePoints.blue);
    return {
        redScore: ((sidePoints.red - sidePoints.blue) / winnerPoints) * 0.5 + 0.5,
        blueScore: ((sidePoints.blue - sidePoints.red) / winnerPoints) * 0.5 + 0.5
    }
};
