var nodeLib = require('/lib/xp/node');
var contentLib = require('/lib/xp/content');
var valueLib = require('/lib/xp/value');

var LEGACY_APP_NAME = 'systems.rcd.enonic.foos';
var REPO_NAME = 'office-league';
var LEAGUES_PATH = '/leagues';
var PLAYERS_PATH = '/players';
var TEAMS_PATH = '/teams';

var TYPE = {
    PLAYER: 'player',
    TEAM: 'team',
    GAME: 'game',
    GAME_PLAYER: 'gamePlayer',
    GAME_TEAM: 'gameTeam',
    LEAGUE: 'league',
    LEAGUE_PLAYER: 'leaguePlayer',
    LEAGUE_TEAM: 'leagueTeam'
};

exports.get = function (req) {

    var repoConn = nodeLib.connect({
        repoId: REPO_NAME,
        branch: 'master',
        principals: ["role:system.admin"]
    });
    importPlayers(repoConn);
    importTeams(repoConn);
    importLeague(repoConn);

    log.info('Import completed!');

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
        // log.info(JSON.stringify(t));
        createTeam(repoConn, t);
    }
};

var importLeague = function (repoConn) {
    var imageValue = null; // TODO
    var leagueNode = repoConn.create({
        _name: 'enonic-foos',
        _parentPath: LEAGUES_PATH,
        type: TYPE.LEAGUE,
        name: 'Enonic Foos',
        sport: 'foos',
        image: imageValue,
        description: 'Enonic Foos League',
        config: {},
        playerStats: {},
        teamStats: {}
    });

    var playersNode = repoConn.create({
        _name: 'players',
        _parentPath: leagueNode._path
    });
    var teamsNode = repoConn.create({
        _name: 'teams',
        _parentPath: leagueNode._path
    });
    var gamesNode = repoConn.create({
        _name: 'games',
        _parentPath: leagueNode._path
    });

    var from = 0, games = [], i;
    do {
        from = from + games.length;
        games = fetchGames(from);
        for (i = 0; i < games.length; i++) {
            createGame(repoConn, gamesNode, games[i], valueLib.reference(leagueNode._id));
        }
    } while (games && games.length > 0);

    // add players to league
    var playersResult = repoConn.findChildren({
        start: 0,
        count: 1000,
        parentKey: PLAYERS_PATH
    });
    var playerIds = playersResult.hits.map(function (hit) {
        return hit.id;
    });
    var players = repoConn.get(playerIds);
    players.forEach(function (player) {
        repoConn.create({
            _parentPath: playersNode._path,
            type: TYPE.LEAGUE_PLAYER,
            playerId: valueLib.reference(player._id),
            leagueId: valueLib.reference(leagueNode._id),
            rating: 0
        });
    });

    // add teams to league
    var teamsResult = repoConn.findChildren({
        start: 0,
        count: 1000,
        parentKey: TEAMS_PATH
    });
    var teamIds = teamsResult.hits.map(function (hit) {
        return hit.id;
    });
    var teams = repoConn.get(teamIds);
    teams.forEach(function (team) {
        repoConn.create({
            _parentPath: teamsNode._path,
            type: TYPE.LEAGUE_TEAM,
            teamId: valueLib.reference(team._id),
            leagueId: valueLib.reference(leagueNode._id),
            rating: 0
        });
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

var createGame = function (repoConn, gamesNode, foosGame, leagueId) {
    var blueIds = [], redIds = [], goals = [], playerTable = {};
    var foosGoal, goal;
    var pw1, pw2, pl1, pl2;
    var gamePlayers = {}, gameTeams = {};

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

        gamePlayers[playerTable[pw1]] = {
            playerId: valueLib.reference(playerTable[pw1]),
            score: foosGame.data.winners[0].score,
            scoreAgainst: foosGame.data.winners[0].against,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winners[0].ratingDiff
        };
        gamePlayers[playerTable[pw2]] = {
            playerId: valueLib.reference(playerTable[pw2]),
            score: foosGame.data.winners[1].score,
            scoreAgainst: foosGame.data.winners[1].against,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winners[1].ratingDiff
        };
        gamePlayers[playerTable[pl1]] = {
            playerId: valueLib.reference(playerTable[pl1]),
            score: foosGame.data.losers[0].score,
            scoreAgainst: foosGame.data.losers[0].against,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.losers[0].ratingDiff
        };
        gamePlayers[playerTable[pl2]] = {
            playerId: valueLib.reference(playerTable[pl2]),
            score: foosGame.data.losers[1].score,
            scoreAgainst: foosGame.data.losers[1].against,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.losers[1].ratingDiff
        };

        repoConn.refresh();
        var teamNodeW = findTeamIdByPlayerIds(repoConn, playerTable[pw1], playerTable[pw2]);
        if (!teamNodeW) {
            teamNodeW = createTeamWithPlayers(repoConn, playerTable[pw1], playerTable[pw2]);
        }
        var teamNodeL = findTeamIdByPlayerIds(repoConn, playerTable[pl1], playerTable[pl2]);
        if (!teamNodeL) {
            teamNodeL = createTeamWithPlayers(repoConn, playerTable[pl1], playerTable[pl2]);
        }
        gameTeams[teamNodeW] = {
            teamId: valueLib.reference(teamNodeW),
            score: gamePlayers[playerTable[pw1]].score + gamePlayers[playerTable[pw2]].score,
            scoreAgainst: gamePlayers[playerTable[pw1]].scoreAgainst + gamePlayers[playerTable[pw2]].scoreAgainst,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winnerTeamRatingDiff
        };
        gameTeams[teamNodeL] = {
            teamId: valueLib.reference(teamNodeL),
            score: gamePlayers[playerTable[pl1]].score + gamePlayers[playerTable[pl2]].score,
            scoreAgainst: gamePlayers[playerTable[pl1]].scoreAgainst + gamePlayers[playerTable[pl2]].scoreAgainst,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.loserTeamRatingDiff
        };
    } else {
        pw1 = foosGame.data.winners.playerId;
        pl1 = foosGame.data.losers.playerId;
        playerTable[pw1] = findPlayerNodeById(repoConn, pw1);
        playerTable[pl1] = findPlayerNodeById(repoConn, pl1);

        blueIds.push(valueLib.reference(playerTable[pw1]));
        redIds.push(valueLib.reference(playerTable[pl1]));

        gamePlayers[playerTable[pw1]] = {
            playerId: valueLib.reference(playerTable[pw1]),
            score: foosGame.data.winners.score,
            scoreAgainst: foosGame.data.winners.against,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winners.ratingDiff
        };
        gamePlayers[playerTable[pl1]] = {
            playerId: valueLib.reference(playerTable[pl1]),
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
            playerId: valueLib.reference(playerTable[foosGoal.playerId]),
            time: foosGoal.time,
            against: foosGoal.against
        };
        goals.push(goal);
    }

    var gameNode = repoConn.create({
        _parentPath: gamesNode._path,
        type: TYPE.GAME,
        leagueId: leagueId,
        time: valueLib.instant(foosGame.createdTime),
        finished: true,
        points: goals
    });

    var k, gamePlayer, gameTeam;
    for (k in gamePlayers) {
        gamePlayer = gamePlayers[k];
        gamePlayer._parentPath = gameNode._path;
        gamePlayer.leagueId = leagueId;
        gamePlayer.type = TYPE.GAME_PLAYER,
            gamePlayer.time = gameNode.time;
        gamePlayer.gameId = gameNode._id;
        repoConn.create(gamePlayer);
    }

    for (k in gameTeams) {
        gameTeam = gameTeams[k];
        gameTeam._parentPath = gameNode._path;
        gameTeam.leagueId = leagueId;
        gameTeam.type = TYPE.GAME_TEAM,
            gameTeam.time = gameNode.time;
        gameTeam.gameId = gameNode._id;
        repoConn.create(gameTeam);
    }
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
        type: TYPE.PLAYER,
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
        type: TYPE.TEAM,
        name: foosTeam.displayName,
        image: imageValue,
        description: foosTeam.data.description,
        playerIds: players
    });
};

var createTeamWithPlayers = function (repoConn, playerId1, playerId2) {
    var playerIds = [];
    playerIds.push(playerId1);
    playerIds.push(playerId2);
    var player1 = repoConn.get(playerId1);
    var player2 = repoConn.get(playerId2);

    var teamName = player1._name + player2._name;
    var teamNode = repoConn.create({
        _name: teamName,
        _parentPath: TEAMS_PATH,
        type: TYPE.TEAM,
        name: 'Team ' + teamName,
        image: null,
        description: '',
        playerIds: playerIds
    });
    return teamNode._id;
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

var findTeamIdByPlayerIds = function (repoConn, playerId1, playerId2) {
    var result = repoConn.query({
        start: 0,
        count: 1,
        query: "playerIds = '" + playerId1 + "' AND playerIds = '" + playerId2 + "'"
    });
    return result.count > 0 && result.hits[0].id;
};

var nodeWithPathExists = function (repoConn, path) {
    var result = repoConn.query({
        start: 0,
        count: 0,
        query: "_path = '" + path + "'"
    });
    return result.total > 0;
};