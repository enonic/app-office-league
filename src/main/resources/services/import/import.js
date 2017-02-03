var contextLib = require('/lib/xp/context');
var nodeLib = require('/lib/xp/node');
var contentLib = require('/lib/xp/content');
var valueLib = require('/lib/xp/value');

var LEGACY_APP_NAME = 'systems.rcd.enonic.foos';
var REPO_NAME = 'office-league';
var LEAGUES_PATH = '/leagues';
var PLAYERS_PATH = '/players';
var TEAMS_PATH = '/teams';

exports.get = function (req) {

    var repoConn = nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master',
        principals: ["role:system.admin"]
    });
    importPlayers(repoConn);
    importTeams(repoConn);
    importLeague(repoConn);

    return {
        contentType: 'application/json',
        body: {
            success: true
        }
    }
};

var importPlayers = function (repoConn) {
    var players = fetchPlayers();
    var p;
    log.info(players.length + ' players found');
    for (var i = 0; i < players.length; i++) {
        p = players[i];
        // log.info(JSON.stringify(p));
        createPlayer(repoConn, p);
    }
};

var importTeams = function (repoConn) {
    var teams = fetchTeams();
    var t;
    log.info(teams.length + ' teams found');
    for (var i = 0; i < teams.length; i++) {
        t = teams[i];
        log.info(JSON.stringify(t));
        createTeam(repoConn, t);
    }
};

var importLeague = function (repoConn) {
    var imageValue = null; // TODO
    var leagueNode = repoConn.create({
        _name: 'enonic-foos',
        _parentPath: LEAGUES_PATH,
        name: 'Enonic Foos',
        sport: 'foos',
        image: imageValue,
        description: 'Enonic Foos League',
        config: {},
        playerStats: {},
        teamStats: {}
    });

    var gamesNode = repoConn.create({
        _name: 'games',
        _parentPath: leagueNode._path,
    });

    var from = 0, games = [], i;
    do {
        from = from + games.length;
        games = fetchGames(from);
        for (i = 0; i < games.length; i++) {
            createGame(repoConn, gamesNode, games[i]);
        }
    } while (games && games.length > 0);
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

var createGame = function (repoConn, gamesNode, foosGame) {
    var blueIds = [], redIds = [], goals = [], playerTable = {};
    var foosGoal, goal;
    var pw1, pw2, pl1, pl2;
    if (foosGame.data.winners.length == 2) {
        pw1 = foosGame.data.winners[0].playerId;
        pw2 = foosGame.data.winners[1].playerId;
        pl1 = foosGame.data.losers[0].playerId;
        pl2 = foosGame.data.losers[1].playerId;
        playerTable[pw1] = findPlayerNodeById(repoConn, pw1);
        playerTable[pw2] = findPlayerNodeById(repoConn, pw2);
        playerTable[pl1] = findPlayerNodeById(repoConn, pl1);
        playerTable[pl2] = findPlayerNodeById(repoConn, pl2);

        blueIds.push(valueLib.reference(playerTable[pw1]));
        blueIds.push(valueLib.reference(playerTable[pw2]));
        redIds.push(valueLib.reference(playerTable[pl1]));
        redIds.push(valueLib.reference(playerTable[pl2]));
    } else {
        pw1 = foosGame.data.winners.playerId;
        pl1 = foosGame.data.losers.playerId;
        playerTable[pw1] = findPlayerNodeById(repoConn, pw1);
        playerTable[pl1] = findPlayerNodeById(repoConn, pl1);

        blueIds.push(valueLib.reference(playerTable[pw1]));
        redIds.push(valueLib.reference(playerTable[pl1]));
    }

    for (var g = 0, l = foosGame.data.goals && foosGame.data.goals.length; g < l; g++) {
        foosGoal = foosGame.data.goals[g];
        goal = {
            playerId: valueLib.reference(playerTable[foosGoal.playerId]),
            time: foosGoal.time,
            against: foosGoal.against
        };
        goals.push(goal);
    }

    var gameNode = repoConn.create({
        _parentPath: gamesNode._path,
        time: valueLib.instant(foosGame.createdTime),
        bluePlayerIds: blueIds,
        redPlayerIds: redIds,
        goals: goals
    });
};

var createPlayer = function (repoConn, foosPlayer) {
    var playerExist = nodeWithPathExists(repoConn, PLAYERS_PATH + '/' + foosPlayer._name);
    if (playerExist) {
        log.warning('Player with name "' + foosPlayer._name + '" already exists, cannot be imported.');
        return;
    }

    var foosImg = foosPlayer.data.picture;
    var imageValue = null, pictureContent;
    if (foosImg) {
        pictureContent = contentLib.get({
            key: foosImg,
            branch: 'draft'
        });
        if (pictureContent) {
            var attachName = pictureContent.data.media.attachment;
            var stream = contentLib.getAttachmentStream({
                key: foosImg,
                name: attachName
            });
            if (stream) {
                imageValue = valueLib.binary(attachName, stream);
            }
        }
    }

    var playerNode = repoConn.create({
        _name: foosPlayer._name,
        _parentPath: PLAYERS_PATH,
        name: foosPlayer.displayName,
        nickname: foosPlayer.data.nickname,
        image: imageValue,
        nationality: 'no',
        handedness: 'right',
        description: foosPlayer.data.description
    });
    // log.info(JSON.stringify(playerNode));
};

var createTeam = function (repoConn, foosTeam) {
    var teamExist = nodeWithPathExists(repoConn, TEAMS_PATH + '/' + foosTeam._name);
    if (teamExist) {
        log.warning('Team with name "' + foosTeam._name + '" already exists, cannot be imported.');
        return;
    }

    var foosImg = foosTeam.data.picture;
    var imageValue = null, pictureContent;
    if (foosImg) {
        pictureContent = contentLib.get({
            key: foosImg,
            branch: 'draft'
        });
        if (pictureContent) {
            var attachName = pictureContent.data.media.attachment;
            var stream = contentLib.getAttachmentStream({
                key: foosImg,
                name: attachName
            });
            if (stream) {
                imageValue = valueLib.binary(attachName, stream);
            }
        }
    }
    var players = [];
    if (!foosTeam.data.playerIds[0]) {
        log.info(JSON.stringify(foosTeam, null, 4));
    }

    log.info(foosTeam.data.playerIds[0]);
    var teamNode = repoConn.create({
        _name: foosTeam._name,
        _parentPath: TEAMS_PATH,
        name: foosTeam.displayName,
        image: imageValue,
        description: foosTeam.data.description,
        playerIds: players
    });
    log.info(JSON.stringify(teamNode));
};

var findPlayerNodeById = function (repoConn, playerContentId) {
    var p = contentLib.get({
        key: playerContentId,
        branch: 'draft'
    });
    if (!p) {
        return null;
    }

    var path = PLAYERS_PATH + '/' + p._name;
    var result = repoConn.get(path);
    return result && result._id;
};

var nodeWithPathExists = function (repoConnection, path) {
    var result = repoConnection.query({
        start: 0,
        count: 0,
        query: "_path = '" + path + "'"
    });
    return result.total > 0;
};