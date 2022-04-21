var eventLib = require('/lib/xp/event');
var eloRating = require('/lib/elo-rating');
var ratingLib = require('/lib/office-league-rating');
var storeLib = require('office-league-store');

var OFFICE_LEAGUE_GAME_EVENT_ID = 'office-league-game';
var OFFICE_LEAGUE_GAME_REPORT_EVENT_ID = 'office-league-game-report';
exports.OFFICE_LEAGUE_GAME_REPORT_EVENT_ID = OFFICE_LEAGUE_GAME_REPORT_EVENT_ID;


eventLib.listener({
    type: 'custom.' + OFFICE_LEAGUE_GAME_EVENT_ID,
    localOnly: true,
    callback: function (event) {
        storeLib.refresh();
        var game = storeLib.getGameById(event.data.gameId);
        if (game) {
            var baseUrl = app.config['officeleague.baseUrl'] || 'localhost:8080/webapp/com.enonic.app.officeleague';
            var gameData = createGameData(game, baseUrl);

            eventLib.send({
                type: OFFICE_LEAGUE_GAME_REPORT_EVENT_ID,
                distributed: false,
                data: {
                    game: JSON.stringify(gameData)
                }
            });

        }
    }
});

const createGameData = function (game, baseUrl) {
    const gameData = {
        gameId: game._id,
        url: url(baseUrl, '/games/' + game._id),
        finished: game.finished,
        startTime: game.time,
        modifiedTime: game._timestamp,
        points: [].concat(game.points || []),
        players: [],
        playerCount: game.gamePlayers.length,
        teamCount: game.gameTeams.length,
        teams: [],
        league: {},
        sides: {
            blue: {
                totalScore: 0,
                expectedScore: 0
            },
            red: {
                totalScore: 0,
                expectedScore: 0
            }
        }
    };

    var league = storeLib.getLeagueById(game.leagueId);
    gameData.league = createLeagueJson(league, baseUrl);

    var p, gp, playerJson, player, leaguePlayer;
    for (p = 0; p < game.gamePlayers.length; p++) {
        gp = game.gamePlayers[p];
        player = storeLib.getPlayerById(gp.playerId);
        leaguePlayer = storeLib.getLeaguePlayerByLeagueIdAndPlayerId(game.leagueId, gp.playerId);

        playerJson = createPlayerJson(player, gp, leaguePlayer, baseUrl);
        playerJson.ranking = storeLib.getRankingForPlayerLeague(gp.playerId, game.leagueId);
        gameData.players.push(playerJson);

        if (gp.side === 'red') {
            gameData.sides.red.totalScore += gp.score;
            gameData.sides.blue.totalScore += gp.scoreAgainst;
        } else if (gp.side === 'blue') {
            gameData.sides.blue.totalScore += gp.score;
            gameData.sides.red.totalScore += gp.scoreAgainst;
        }
    }

    var t, gt, teamJson, team, leagueTeam;
    for (t = 0; t < game.gameTeams.length; t++) {
        gt = game.gameTeams[t];
        team = storeLib.getTeamById(gt.teamId);
        leagueTeam = storeLib.getLeagueTeamByLeagueIdAndTeamId(game.leagueId, gt.teamId);

        teamJson = createTeamJson(team, gt, leagueTeam, baseUrl);
        teamJson.ranking = storeLib.getRankingForTeamLeague(gt.teamId, game.leagueId);
        gameData.teams.push(teamJson);
    }
    var winPoints = (league.rules || {}).pointsToWin || 10;
    setExpectedScore(gameData, winPoints);

    return gameData;
};

var createTeamJson = function (team, gameTeam, leagueTeam, baseUrl) {
    return {
        teamId: gameTeam.teamId,
        name: team.name,
        description: team.description,
        imageUrl: url(baseUrl, team.imageUrl),
        score: gameTeam.score,
        scoreAgainst: gameTeam.scoreAgainst,
        side: gameTeam.side,
        winner: gameTeam.winner,
        ratingDelta: gameTeam.ratingDelta,
        rating: leagueTeam ? leagueTeam.rating : ratingLib.INITIAL_RATING
    };
};

var createPlayerJson = function (player, gamePlayer, leaguePlayer, baseUrl) {
    return {
        playerId: gamePlayer.playerId,
        name: player.name,
        description: player.description,
        imageUrl: url(baseUrl, player.imageUrl),
        nationality: player.nationality,
        handedness: player.handedness,
        score: gamePlayer.score,
        scoreAgainst: gamePlayer.scoreAgainst,
        side: gamePlayer.side,
        winner: gamePlayer.winner,
        ratingDelta: gamePlayer.ratingDelta,
        rating: leaguePlayer ? leaguePlayer.rating : ratingLib.INITIAL_RATING
    };
};

var createLeagueJson = function (league, baseUrl) {
    return {
        leagueId: league._id,
        name: league.name,
        description: league.description,
        slackIntegration: league.slackIntegration || false,
        imageUrl: url(baseUrl, league.imageUrl)
    };
};

var setExpectedScore = function (gameJson, winPoints) {
    var redRating = [], blueRating = [];
    for (const player of gameJson.players) {
        if (player.side === 'red') {
            redRating.push(player.rating);
        } else {
            blueRating.push(player.rating);
        }
    }

    var expectedScore = eloRating.calculateExpectedScore(avg(redRating), avg(blueRating));
    var sideExpectedPoints = eloRating.scoreToPoints(expectedScore, winPoints);

    gameJson.sides.red.expectedScore = sideExpectedPoints[0];
    gameJson.sides.blue.expectedScore = sideExpectedPoints[1];
};

var avg = function (numberArray) {
    var sum = numberArray.reduce(function (a, b) {
        return a + b;
    });
    return sum / numberArray.length;
};

var url = function (baseUrl, relUrl) {
    return baseUrl + relUrl;
};
