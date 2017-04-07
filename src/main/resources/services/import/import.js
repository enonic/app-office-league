var contentLib = require('/lib/xp/content');
var storeLib = require('/lib/office-league-store');
var rankingLib = require('../ranking/ranking');

var LEGACY_APP_NAME = 'systems.rcd.enonic.foos';

exports.get = function (req) {

    var playerContentToNodeId = importPlayers();
    importTeams(playerContentToNodeId);
    storeLib.refresh();
    var league = importLeague(playerContentToNodeId);
    rankingLib.updateLeagues([league]);
    removeRetiredPlayers(playerContentToNodeId);

    log.info('Import completed!');

    return {
        contentType: 'application/json',
        body: {
            success: true
        }
    }
};

var importPlayers = function () {
    var players = fetchPlayers();
    var p;
    log.info(players.length + ' players found');
    var playerContentToNodeId = {};
    for (var i = 0; i < players.length; i++) {
        p = players[i];
        // log.info(JSON.stringify(p));
        var playerIds = createPlayer(p);
        playerContentToNodeId[playerIds.contentId] = playerIds.nodeId;
    }
    return playerContentToNodeId;
};

var importTeams = function (playerContentToNodeId) {
    var teams = fetchTeams();
    var t;
    log.info(teams.length + ' teams found');
    for (var i = 0; i < teams.length; i++) {
        t = teams[i];
        // log.info(JSON.stringify(t));
        createTeam(t, playerContentToNodeId);
    }
};

var importLeague = function (playerContentToNodeId) {
    var leagueNode = storeLib.createLeague({
        name: 'Enonic Foos',
        description: 'Enonic Foos League',
        sport: 'foos'
    });

    var from = 0, games = [], i;
    do {
        from = from + games.length;
        games = fetchGames(from);
        for (i = 0; i < games.length; i++) {
            createGame(games[i], leagueNode._id, playerContentToNodeId);
        }
    } while (games && games.length > 0);

    // add players to league
    var playersResult = storeLib.getPlayers(0, 1000);
    playersResult.hits.forEach(function (player) {
        var playerLeagues = storeLib.getLeaguesByPlayerId(player._id, 0, 0);
        if (playerLeagues.total !== 0) {
            log.info('Skipping player from another league: ' + player.name);
            return;
        }
        storeLib.joinPlayerLeague(leagueNode._id, player._id);
        storeLib.refresh();
        var contentPlayer = findPlayerContentByName(player.name);
        if (contentPlayer) {
            storeLib.setPlayerLeagueRating(leagueNode._id, player._id, contentPlayer.data.rating);
        }
    });

    // add teams to league
    var teamsResult = storeLib.getTeams(0, 1000);
    teamsResult.hits.forEach(function (team) {
        var teamLeagues = storeLib.getLeaguesByTeamId(team._id, 0, 0);
        if (teamLeagues.total !== 0) {
            log.info('Skipping team from another league: ' + team.name);
            return;
        }
        storeLib.joinTeamLeague(leagueNode._id, team._id);
        storeLib.refresh();
        var contentTeam = findTeamContentByName(team.name);
        if (contentTeam) {
            storeLib.setTeamLeagueRating(leagueNode._id, team._id, contentTeam.data.rating);
        }
    });
    return leagueNode;
};

var removeRetiredPlayers = function (playerContentToNodeId) {
    var retiredPlayers = contentLib.query({
        start: 0,
        count: -1,
        contentTypes: [LEGACY_APP_NAME + ":player"],
        query: "data.retired != 'false'",
        branch: 'draft'
    }).hits;
    log.info('removeRetiredPlayers: ' + JSON.stringify(retiredPlayers, null, 2));

    var p, playerId, leagues, l, teams, t, team;
    for (p = 0; p < retiredPlayers.length; p++) {
        playerId = playerContentToNodeId[retiredPlayers[p]._id];
        // log.info('removeRetiredPlayers: ' + playerId + ' ' + retiredPlayers[p]);
        leagues = storeLib.getLeaguesByPlayerId(playerId).hits;
        // log.info('removeRetiredPlayers leagues: ' + JSON.stringify(leagues, null, 2));
        for (l = 0; l < leagues.length; l++) {
            log.info('Removing player [' + playerId + '] from league "' + leagues[l].name + '"');
            storeLib.leavePlayerLeague(leagues[l]._id, playerId);

            teams = storeLib.getTeamsByPlayerId(playerId, 0, -1).hits;
            for (t = 0; t < teams.length; t++) {
                team = teams [t];
                storeLib.leaveTeamLeague(leagues[l]._id, team._id);
                log.info('Removing team [' + team.name + '] from league "' + leagues[l].name + '"');
            }
        }
    }
};

var fetchGames = function (from) {
    from = from || 0;
    return contentLib.query({
        start: from,
        count: 10,
        contentTypes: [LEGACY_APP_NAME + ":game"],
        query: "data.retired != 'true'",
        sort: "createdTime ASC",
        branch: 'draft'
    }).hits;
};

var fetchPlayers = function () {
    return contentLib.query({
        start: 0,
        count: -1,
        contentTypes: [LEGACY_APP_NAME + ":player"],
        // query: "data.retired != 'true'",
        branch: 'draft'
    }).hits;
};

var fetchTeams = function () {
    return contentLib.query({
        start: 0,
        count: -1,
        contentTypes: [LEGACY_APP_NAME + ":team"],
        // query: "data.retired != 'true'",
        branch: 'draft'
    }).hits;
};

var createGame = function (foosGame, leagueId, playerContentToNodeId) {
    var blueIds = [], redIds = [], goals = [], playerTable = {};
    var foosGoal, goal;
    var pw1, pw2, pl1, pl2;
    var gamePlayers = {}, gameTeams = {};

    if (foosGame.data.winners.length == 2) {
        pw1 = foosGame.data.winners[0].playerId;
        pw2 = foosGame.data.winners[1].playerId;
        pl1 = foosGame.data.losers[0].playerId;
        pl2 = foosGame.data.losers[1].playerId;

        blueIds.push(playerContentToNodeId[pw1]);
        blueIds.push(playerContentToNodeId[pw2]);
        redIds.push(playerContentToNodeId[pl1]);
        redIds.push(playerContentToNodeId[pl2]);

        gamePlayers[playerContentToNodeId[pw1]] = {
            playerId: playerContentToNodeId[pw1],
            score: foosGame.data.winners[0].score || 0,
            scoreAgainst: foosGame.data.winners[0].against || 0,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winners[0].ratingDiff
        };
        gamePlayers[playerContentToNodeId[pw2]] = {
            playerId: playerContentToNodeId[pw2],
            score: foosGame.data.winners[1].score || 0,
            scoreAgainst: foosGame.data.winners[1].against || 0,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winners[1].ratingDiff
        };
        gamePlayers[playerContentToNodeId[pl1]] = {
            playerId: playerContentToNodeId[pl1],
            score: foosGame.data.losers[0].score || 0,
            scoreAgainst: foosGame.data.losers[0].against || 0,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.losers[0].ratingDiff
        };
        gamePlayers[playerContentToNodeId[pl2]] = {
            playerId: playerContentToNodeId[pl2],
            score: foosGame.data.losers[1].score || 0,
            scoreAgainst: foosGame.data.losers[1].against || 0,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.losers[1].ratingDiff
        };

        storeLib.refresh();
        var teamNodeW = storeLib.getTeamByPlayerIds(playerContentToNodeId[pw1], playerContentToNodeId[pw2]);
        teamNodeW = teamNodeW ? teamNodeW._id : null;
        if (!teamNodeW) {
            teamNodeW = createTeamWithPlayers(playerContentToNodeId[pw1], playerContentToNodeId[pw2]);
        }
        var teamNodeL = storeLib.getTeamByPlayerIds(playerContentToNodeId[pl1], playerContentToNodeId[pl2]);
        teamNodeL = teamNodeL ? teamNodeL._id : null;
        if (!teamNodeL) {
            teamNodeL = createTeamWithPlayers(playerContentToNodeId[pl1], playerContentToNodeId[pl2]);
        }
        gameTeams[teamNodeW] = {
            teamId: teamNodeW,
            score: gamePlayers[playerContentToNodeId[pw1]].score + gamePlayers[playerContentToNodeId[pw2]].score,
            scoreAgainst: gamePlayers[playerContentToNodeId[pw1]].scoreAgainst + gamePlayers[playerContentToNodeId[pw2]].scoreAgainst,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winnerTeamRatingDiff
        };
        gameTeams[teamNodeL] = {
            teamId: teamNodeL,
            score: gamePlayers[playerContentToNodeId[pl1]].score + gamePlayers[playerContentToNodeId[pl2]].score,
            scoreAgainst: gamePlayers[playerContentToNodeId[pl1]].scoreAgainst + gamePlayers[playerContentToNodeId[pl2]].scoreAgainst,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.loserTeamRatingDiff
        };
    } else {
        pw1 = foosGame.data.winners.playerId;
        pl1 = foosGame.data.losers.playerId;

        blueIds.push(playerContentToNodeId[pw1]);
        redIds.push(playerContentToNodeId[pl1]);

        gamePlayers[playerContentToNodeId[pw1]] = {
            playerId: playerContentToNodeId[pw1],
            score: foosGame.data.winners.score,
            scoreAgainst: foosGame.data.winners.against,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winners.ratingDiff
        };
        gamePlayers[playerContentToNodeId[pl1]] = {
            playerId: playerContentToNodeId[pl1],
            score: foosGame.data.losers.score,
            scoreAgainst: foosGame.data.losers.against,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.losers.ratingDiff
        };
    }

    for (var g = 0, l = foosGame.data.goals && foosGame.data.goals.length; g < l; g++) {
        foosGoal = foosGame.data.goals[g];
        goal = {
            playerId: playerContentToNodeId[foosGoal.playerId],
            time: foosGoal.time,
            against: foosGoal.against
        };
        goals.push(goal);
    }

    var k, gamePlayerList = [], gameTeamList = [];
    for (k in gamePlayers) {
        gamePlayerList.push(gamePlayers[k]);
    }
    for (k in gameTeams) {
        gameTeamList.push(gameTeams[k]);
    }
    storeLib.createGame({
        leagueId: leagueId,
        finished: true,
        time: foosGame.createdTime,
        points: goals,
        gamePlayers: gamePlayerList,
        gameTeams: gameTeamList
    });
};

var createPlayer = function (foosPlayer) {
    var playerExist = storeLib.getPlayerByName(foosPlayer._name);
    if (playerExist) {
        log.warning('Player with name "' + foosPlayer._name + '" already exists, cannot be imported.');
        return;
    }

    var foosImg = foosPlayer.data.picture;
    var pictureContent, stream, mimeType;
    if (foosImg) {
        pictureContent = contentLib.get({
            key: foosImg,
            branch: 'draft'
        });
        if (pictureContent) {
            var attachName = pictureContent.data.media.attachment;
            stream = contentLib.getAttachmentStream({
                key: foosImg,
                name: attachName
            });
            if (stream) {
                mimeType = contentLib.getAttachments(foosImg)[attachName].mimeType;
            }
        }
    }

    var playerNode = storeLib.createPlayer({
        name: foosPlayer.displayName,
        fullname: foosPlayer.displayName,
        description: foosPlayer.data.nickname,
        nationality: 'no',
        handedness: 'right',
        imageStream: stream,
        imageType: mimeType
    });

    return {
        contentId: foosPlayer._id,
        nodeId: playerNode._id
    };
};

var createTeam = function (foosTeam, playerContentToNodeId) {
    var teamExist = storeLib.getTeamByName(foosTeam._name);
    if (teamExist) {
        log.warning('Team with name "' + foosTeam._name + '" already exists, cannot be imported.');
        return;
    }

    var foosImg = foosTeam.data.picture;
    var pictureContent, stream, mimeType;
    if (foosImg) {
        pictureContent = contentLib.get({
            key: foosImg,
            branch: 'draft'
        });
        if (pictureContent) {
            var attachName = pictureContent.data.media.attachment;
            stream = contentLib.getAttachmentStream({
                key: foosImg,
                name: attachName
            });
            if (stream) {
                mimeType = contentLib.getAttachments(foosImg)[attachName].mimeType;
            }
        }
    }
    var players = [];
    players.push(playerContentToNodeId[foosTeam.data.playerIds[0]]);
    players.push(playerContentToNodeId[foosTeam.data.playerIds[1]]);

    var playerNode = storeLib.createTeam({
        name: foosTeam.displayName,
        description: foosTeam.data.description,
        imageStream: stream,
        imageType: mimeType,
        playerIds: players
    });
};

var createTeamWithPlayers = function (playerId1, playerId2) {
    var playerIds = [];
    playerIds.push(playerId1);
    playerIds.push(playerId2);

    var teamNode = storeLib.createTeam({
        description: '',
        playerIds: playerIds
    });
    return teamNode._id;
};

var findPlayerContentByName = function (playerContentName) {
    var results = contentLib.query({
        start: 0,
        count: 1,
        query: "_name = '" + playerContentName + "'",
        branch: "draft",
        contentTypes: [LEGACY_APP_NAME + ":player"]
    });

    return results.count > 0 ? results.hits[0] : null;
};

var findTeamContentByName = function (teamContentName) {
    var results = contentLib.query({
        start: 0,
        count: 1,
        query: "displayName = '" + teamContentName + "'",
        branch: "draft",
        contentTypes: [LEGACY_APP_NAME + ":team"]
    });

    return results.count > 0 ? results.hits[0] : null;
};
