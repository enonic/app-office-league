var contentLib = require('/lib/xp/content');
var storeLib = require('/lib/office-league-store');

var LEGACY_APP_NAME = 'systems.rcd.enonic.foos';

exports.get = function (req) {

    importPlayers();
    importTeams();
    storeLib.refresh();
    importLeague();

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
    for (var i = 0; i < players.length; i++) {
        p = players[i];
        // log.info(JSON.stringify(p));
        createPlayer(p);
    }
};

var importTeams = function () {
    var teams = fetchTeams();
    var t;
    log.info(teams.length + ' teams found');
    for (var i = 0; i < teams.length; i++) {
        t = teams[i];
        // log.info(JSON.stringify(t));
        createTeam(t);
    }
};

var importLeague = function () {
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
            createGame(games[i], leagueNode._id);
        }
    } while (games && games.length > 0);

    // add players to league
    var playersResult = storeLib.getPlayers(0, 1000);
    playersResult.players.forEach(function (player) {
        storeLib.joinPlayerLeague(leagueNode._id, player._id);
    });

    // add teams to league
    var teamsResult = storeLib.getTeams(0, 1000);
    teamsResult.teams.forEach(function (team) {
        storeLib.joinTeamLeague(leagueNode._id, team._id);
    });
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

var createGame = function (foosGame, leagueId) {
    var blueIds = [], redIds = [], goals = [], playerTable = {};
    var foosGoal, goal;
    var pw1, pw2, pl1, pl2;
    var gamePlayers = {}, gameTeams = {};

    if (foosGame.data.winners.length == 2) {
        pw1 = foosGame.data.winners[0].playerId;
        pw2 = foosGame.data.winners[1].playerId;
        pl1 = foosGame.data.losers[0].playerId;
        pl2 = foosGame.data.losers[1].playerId;
        playerTable[pw1] = findPlayerNodeById(pw1);
        playerTable[pw2] = findPlayerNodeById(pw2);
        playerTable[pl1] = findPlayerNodeById(pl1);
        playerTable[pl2] = findPlayerNodeById(pl2);

        blueIds.push(playerTable[pw1]);
        blueIds.push(playerTable[pw2]);
        redIds.push(playerTable[pl1]);
        redIds.push(playerTable[pl2]);

        gamePlayers[playerTable[pw1]] = {
            playerId: playerTable[pw1],
            score: foosGame.data.winners[0].score,
            scoreAgainst: foosGame.data.winners[0].against,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winners[0].ratingDiff
        };
        gamePlayers[playerTable[pw2]] = {
            playerId: playerTable[pw2],
            score: foosGame.data.winners[1].score,
            scoreAgainst: foosGame.data.winners[1].against,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winners[1].ratingDiff
        };
        gamePlayers[playerTable[pl1]] = {
            playerId: playerTable[pl1],
            score: foosGame.data.losers[0].score,
            scoreAgainst: foosGame.data.losers[0].against,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.losers[0].ratingDiff
        };
        gamePlayers[playerTable[pl2]] = {
            playerId: playerTable[pl2],
            score: foosGame.data.losers[1].score,
            scoreAgainst: foosGame.data.losers[1].against,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.losers[1].ratingDiff
        };

        storeLib.refresh();
        var teamNodeW = storeLib.getTeamByPlayerIds(playerTable[pw1], playerTable[pw2]);
        teamNodeW = teamNodeW ? teamNodeW._id : null;
        if (!teamNodeW) {
            teamNodeW = createTeamWithPlayers(playerTable[pw1], playerTable[pw2]);
        }
        var teamNodeL = storeLib.getTeamByPlayerIds(playerTable[pl1], playerTable[pl2]);
        teamNodeL = teamNodeL ? teamNodeL._id : null;
        if (!teamNodeL) {
            teamNodeL = createTeamWithPlayers(playerTable[pl1], playerTable[pl2]);
        }
        gameTeams[teamNodeW] = {
            teamId: teamNodeW,
            score: gamePlayers[playerTable[pw1]].score + gamePlayers[playerTable[pw2]].score,
            scoreAgainst: gamePlayers[playerTable[pw1]].scoreAgainst + gamePlayers[playerTable[pw2]].scoreAgainst,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winnerTeamRatingDiff
        };
        gameTeams[teamNodeL] = {
            teamId: teamNodeL,
            score: gamePlayers[playerTable[pl1]].score + gamePlayers[playerTable[pl2]].score,
            scoreAgainst: gamePlayers[playerTable[pl1]].scoreAgainst + gamePlayers[playerTable[pl2]].scoreAgainst,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.loserTeamRatingDiff
        };
    } else {
        pw1 = foosGame.data.winners.playerId;
        pl1 = foosGame.data.losers.playerId;
        playerTable[pw1] = findPlayerNodeById(pw1);
        playerTable[pl1] = findPlayerNodeById(pl1);

        blueIds.push(playerTable[pw1]);
        redIds.push(playerTable[pl1]);

        gamePlayers[playerTable[pw1]] = {
            playerId: playerTable[pw1],
            score: foosGame.data.winners.score,
            scoreAgainst: foosGame.data.winners.against,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winners.ratingDiff
        };
        gamePlayers[playerTable[pl1]] = {
            playerId: playerTable[pl1],
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
            playerId: playerTable[foosGoal.playerId],
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
        nickname: foosPlayer.data.nickname,
        description: foosPlayer.data.description,
        nationality: 'no',
        handedness: 'right',
        imageStream: stream,
        imageType: mimeType
    });

    // log.info(JSON.stringify(playerNode));
};

var createTeam = function (foosTeam) {
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
    players.push(findPlayerNodeById(foosTeam.data.playerIds[0]));
    players.push(findPlayerNodeById(foosTeam.data.playerIds[1]));

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
    var player1 = storeLib.getPlayerById(playerId1);
    var player2 = storeLib.getPlayerById(playerId2);

    var teamName = player1._name + player2._name;
    var teamNode = storeLib.createTeam({
        name: 'Team ' + teamName,
        description: '',
        playerIds: playerIds
    });
    return teamNode._id;
};

var findPlayerNodeById = function (playerContentId) {
    var p = contentLib.get({
        key: playerContentId,
        branch: 'draft'
    });
    if (!p) {
        return null;
    }

    var result = storeLib.getPlayerByName(p.displayName);
    return result && result._id;
};
