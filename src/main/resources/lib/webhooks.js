var eventLib = require('/lib/xp/event');
var storeLib = require('office-league-store');
var eloRating = require('/lib/elo-rating');
var contextLib = require('/lib/xp/context');
var httpClient = require('/lib/xp/http-client');

var OFFICE_LEAGUE_GAME_EVENT_ID = storeLib.OFFICE_LEAGUE_GAME_EVENT_ID;
var UUID = Java.type('java.util.UUID');

exports.setupWebHooks = function () {
    var baseUrl = app.config['webhooks.baseUrl'] || 'http://localhost:8080/admin/portal/preview/draft/office-league/app';

    eventLib.listener({
        type: 'custom.' + OFFICE_LEAGUE_GAME_EVENT_ID,
        localOnly: true,
        callback: function (event) {
            var enabled = app.config['webhooks.enabled'] === 'true';
            if (!enabled) {
                return;
            }

            var gameId = event.data.gameId;
            processGameWebhook(gameId, baseUrl);
        }
    });

};

var processGameWebhook = function (gameId, baseUrl) {
    contextLib.run({
        user: {
            login: 'su',
            userStore: 'system'
        },
        principals: ["role:system.admin"]
    }, function () {
        storeLib.refresh();
        var game = storeLib.getGameById(gameId);
        if (!game) {
            return;
        }

        var gameJson = createGameJson(game, baseUrl);
        postWebhooks(gameJson);
    });
};

var postWebhooks = function (gameJson) {
    var urls = [];
    for (var key in app.config) {
        if (key.indexOf('webhooks.server.') === 0 && key.endsWith('.url')) {
            urls.push(app.config[key]);
        }
    }

    for (var u = 0; u < urls.length; u++) {
        try {
            postWebhook(gameJson, urls[u]);
        } catch (e) {
            log.warning('Error posting to webhook: ' + urls[u]);
            if (e.printStackTrace) {
                e.printStackTrace();
            }
        }
    }
};

var postWebhook = function (gameJson, url) {
    var event = {
        id: "evt_" + randomId(),
        event: "game.updated",
        created: Math.floor(new Date().getTime() / 1000),
        data: {
            game: gameJson
        }
    };

    var response = httpClient.request({
        url: url,
        method: 'POST',
        contentType: 'application/json',
        body: JSON.stringify(event),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.status >= 300 || response.status < 200) {
        log.info('Error posting webhook to [' + url + ']: ' + response.status + ' ' + response.message);
    }
};

var createGameJson = function (game, baseUrl) {
    var gameJson = {
        gameId: game._id,
        gameUrl: url(baseUrl, '/games/' + game._id),
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
    gameJson.league = createLeagueJson(league, baseUrl);

    var p, gp, playerJson, player, leaguePlayer;
    for (p = 0; p < game.gamePlayers.length; p++) {
        gp = game.gamePlayers[p];
        player = storeLib.getPlayerById(gp.playerId);
        leaguePlayer = storeLib.getLeaguePlayerByLeagueIdAndPlayerId(game.leagueId, gp.playerId);

        playerJson = createPlayerJson(player, gp, leaguePlayer, baseUrl);
        playerJson.ranking = storeLib.getRankingForPlayerLeague(gp.playerId, game.leagueId);
        gameJson.players[playerJson.playerId] = playerJson;

        if (gp.side === 'red') {
            gameJson.sides.red.totalScore += gp.score;
            gameJson.sides.blue.totalScore += gp.scoreAgainst;
        } else if (gp.side === 'blue') {
            gameJson.sides.blue.totalScore += gp.score;
            gameJson.sides.red.totalScore += gp.scoreAgainst;
        }
    }

    var t, gt, teamJson, team, leagueTeam;
    for (t = 0; t < game.gameTeams.length; t++) {
        gt = game.gameTeams[t];
        team = storeLib.getTeamById(gt.teamId);
        leagueTeam = storeLib.getLeagueTeamByLeagueIdAndTeamId(game.leagueId, gt.teamId);

        teamJson = createTeamJson(team, gt, leagueTeam, baseUrl);
        teamJson.ranking = storeLib.getRankingForTeamLeague(gt.teamId, game.leagueId);
        gameJson.teams[teamJson.teamId] = teamJson;
    }
    setExpectedScore(gameJson);

    return gameJson;
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
        rating: leagueTeam.rating
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
        rating: leaguePlayer.rating
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

var setExpectedScore = function (gameJson) {
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
    var sideExpectedPoints = eloRating.scoreToPoints(expectedScore);

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

var randomId = function () {
    return UUID.randomUUID().toString().replace(/-/g, '').toLowerCase();
};