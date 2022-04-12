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
                    game: JSON.stringify(gameData) //TODO Bug in eventLib
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
        players: {},
        playerCount: game.gamePlayers.length,
        teamCount: game.gameTeams.length,
        teams: {},
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
        gameData.players[p] = playerJson;

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
        gameData.teams[t] = teamJson;
    }
    var winPoints = (league.rules || {}).pointsToWin || 10;
    setExpectedScore(gameData, winPoints);

    return createNewMessage(gameData);
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
        imageUrl: url(baseUrl, league.imageUrl)
    };
};

var setExpectedScore = function (gameJson, winPoints) {
    var player, redRating = [], blueRating = [];
    for (var id in gameJson.players) {
        player = gameJson.players[id];
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

function createNewMessage(data) {
    if (data.finished) {
        return createFinishedGameMessage(data);
    } else {
        return createNewGameMessage(data);
    }
}

/**
 * Formats the finished game to a slack message format
 */
function createFinishedGameMessage(data) {
    const message = {
        "blocks": []
    };

    message.blocks.push(
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": `Game finished in ${data.league.name}`
            }
        }
    );

    return message;
}

/**
 * Formats the new game to a slack message format
 * @returns Object
 */
function createNewGameMessage(data) {
    const message = {
        "blocks": []
    };

    message.blocks.push(
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": `New game in  ${data.league.name}`
            }
        }
    );
    if (Array.isArray(data.teams) && data.teams.length > 0) {
        message.blocks.push(
            createTeamSection(data.teams[1], [data.players[0], data.players[2]]),
            createVsTeamSection(data.players),
            createTeamSection(data.teams[0], [data.players[1], data.players[3]])
        );
    } else {
        message.blocks.push(
            createPlayerSection(data.players[0]),
            createVsPlayerSection(data.players),
            createPlayerSection(data.players[1])
        );
    }

    return message;
}

function createVsTeamSection(data) {
    return {
        "type": "context",
        "elements": [
            {
                "type": "image",
                "image_url": `${players[0].imageUrl}`,
                "alt_text": `Profile image of ${players[0].name}`
            },
            {
                "type": "image",
                "image_url": `${players[2].imageUrl}`,
                "alt_text": `Profile image of ${players[2].name}`
            },
            {
                "type": "mrkdwn",
                "text": "*VS*"
            },
            {
                "type": "image",
                "image_url": `${players[1].imageUrl}`,
                "alt_text": `Profile image of ${players[1].name}`
            },
            {
                "type": "image",
                "image_url": `${players[3].imageUrl}`,
                "alt_text": `Profile image of ${players[3].name}`
            }
        ]
    };
}

function createVsPlayerSection(players) {
    return {
        "type": "context",
        "elements": [
            {
                "type": "mrkdwn",
                "text": "*VS*"
            }
        ]
    };
}

function createPlayerSection(player) {
    return {
        "type": "section",
        "fields": [
            {
                "type": "mrkdwn",
                "text": `*${player.name}* ${player.rating}`
            },
        ],
        "accessory": {
            "type": "image",
            "image_url": `${player.imageUrl}`,
            "alt_text": `Profile image of ${player.name}`
        }
    }
}

function createTeamSection(teamData, players) {
    return {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `*${teamData.name}*`
        },
        "fields": [
            {
                "type": "mrkdwn",
                "text": `*${players[0].name}* ${players[0].rating}`
            },
            {
                "type": "mrkdwn",
                "text": `*${players[1].name}* ${players[1].rating}`
            }
        ],
        "accessory": {
            "type": "image",
            "image_url": `${teamData.imageUrl}`,
            "alt_text": `Profile image for ${teamData.name}`
        }
    };
}
