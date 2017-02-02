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

    importPlayers();
    importTeams();

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
    var repoConn = nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master',
        principals: ["role:system.admin"]
    });

    log.info(players.length + ' players found');
    for (var i = 0; i < players.length; i++) {
        p = players[i];
        // log.info(JSON.stringify(p));
        createPlayer(repoConn, p);
    }
};

var importTeams = function () {
    var teams = fetchTeams();
    var t;
    var repoConn = nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master',
        principals: ["role:system.admin"]
    });

    log.info(teams.length + ' teams found');
    for (var i = 0; i < teams.length; i++) {
        t = teams[i];
        log.info(JSON.stringify(t));
        createTeam(repoConn, t);
    }
};

var fetchPlayers = function () {
    return contentLib.query({
        start: 0,
        count: -1,
        contentTypes: [LEGACY_APP_NAME + ":player"],
        query: "data.retired != 'true'",
        branch: 'draft'
    }).hits;
};

var fetchTeams = function () {
    return contentLib.query({
        start: 0,
        count: -1,
        contentTypes: [LEGACY_APP_NAME + ":team"],
        query: "data.retired != 'true'",
        branch: 'draft'
    }).hits;
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
    players.push(findPlayerNodeById(repoConn, foosTeam.data.playerIds[0]));
    players.push(findPlayerNodeById(repoConn, foosTeam.data.playerIds[1]));

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
    log.info(JSON.stringify(p));

    var path = PLAYERS_PATH + '/' + p._name;
    log.info(path);
    var result = repoConn.get(path);
    log.info(JSON.stringify(result));
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