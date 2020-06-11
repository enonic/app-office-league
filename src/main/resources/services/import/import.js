const contentLib = require('/lib/xp/content');
const storeLib = require('/lib/office-league-store');
const rankingLib = require('../ranking/ranking');

const LEGACY_APP_NAME = 'systems.rcd.enonic.foos';

exports.get = function (req) {

    let playerContentToNodeId = importPlayers();
    importTeams(playerContentToNodeId);
    storeLib.refresh();
    let league = importLeague(playerContentToNodeId);
    rankingLib.updateLeagues([league]);
    removeRetiredPlayers(playerContentToNodeId);

    log.info('Import completed!');

    return {
        contentType: 'application/json',
        body: {
            success: true
        }
    };
};

const importPlayers = function () {
    let players = fetchPlayers();
    let p;
    log.info(players.length + ' players found');
    let playerContentToNodeId = {};
    for (let i = 0; i < players.length; i++) {
        p = players[i];
        // log.info(JSON.stringify(p));
        let playerIds = createPlayer(p);
        if (playerIds) {
            playerContentToNodeId[playerIds.contentId] = playerIds.nodeId;
        }
    }
    return playerContentToNodeId;
};

const importTeams = function (playerContentToNodeId) {
    let teams = fetchTeams();
    let t;
    log.info(teams.length + ' teams found');
    for (let i = 0; i < teams.length; i++) {
        t = teams[i];
        // log.info(JSON.stringify(t));
        createTeam(t, playerContentToNodeId);
    }
};

const importLeague = function (playerContentToNodeId) {
    let leagueNode = storeLib.createLeague({
        name: 'Enonic Foos',
        description: 'Enonic Foos League',
        sport: 'foos'
    });

    let from = 0, games = [], i;
    do {
        from = from + games.length;
        games = fetchGames(from);
        for (i = 0; i < games.length; i++) {
            createGame(games[i], leagueNode._id, playerContentToNodeId);
        }
    } while (games && games.length > 0);

    // add players to league
    let playersResult = storeLib.getPlayers(0, 1000);
    playersResult.hits.forEach(function (player) {
        let playerLeagues = storeLib.getLeaguesByPlayerId(player._id, 0, 0);
        if (playerLeagues.total !== 0) {
            log.info('Skipping player from another league: ' + player.name);
            return;
        }
        storeLib.joinPlayerLeague(leagueNode._id, player._id);
        storeLib.refresh();
        let contentPlayer = findPlayerContentByName(player.name);
        if (contentPlayer) {
            storeLib.setPlayerLeagueRating(leagueNode._id, player._id, contentPlayer.data.rating);
        }
    });

    // add teams to league
    let teamsResult = storeLib.getTeams(0, 1000);
    teamsResult.hits.forEach(function (team) {
        let teamLeagues = storeLib.getLeaguesByTeamId(team._id, 0, 0);
        if (teamLeagues.total !== 0) {
            log.info('Skipping team from another league: ' + team.name);
            return;
        }
        storeLib.joinTeamLeague(leagueNode._id, team._id);
        storeLib.refresh();
        let contentTeam = findTeamContentByName(team.name);
        if (contentTeam) {
            storeLib.setTeamLeagueRating(leagueNode._id, team._id, contentTeam.data.rating);
        }
    });

    // set league admins
    let adminP1 = findPlayerContentByName('aro');
    let adminP2 = findPlayerContentByName('gri');
    let adminIds = [playerContentToNodeId[adminP1._id], playerContentToNodeId[adminP2._id]];
    let updatedLeague = storeLib.updateLeague({
        leagueId: leagueNode._id,
        adminPlayerIds: adminIds
    });

    return leagueNode;
};

const removeRetiredPlayers = function (playerContentToNodeId) {
    let retiredPlayers = contentLib.query({
        start: 0,
        count: -1,
        contentTypes: [LEGACY_APP_NAME + ":player"],
        query: "data.retired != 'false'",
        branch: 'draft'
    }).hits;
    log.info('removeRetiredPlayers: ' + JSON.stringify(retiredPlayers, null, 2));

    let p, playerId, leagues, l, teams, t, team;
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

const fetchGames = function (from) {
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

const fetchPlayers = function () {
    return contentLib.query({
        start: 0,
        count: -1,
        contentTypes: [LEGACY_APP_NAME + ":player"],
        // query: "data.retired != 'true'",
        branch: 'draft'
    }).hits;
};

const fetchTeams = function () {
    return contentLib.query({
        start: 0,
        count: -1,
        contentTypes: [LEGACY_APP_NAME + ":team"],
        // query: "data.retired != 'true'",
        branch: 'draft'
    }).hits;
};

const createGame = function (foosGame, leagueId, playerContentToNodeId) {
    let blueIds = [], redIds = [], goals = [], playerTable = {};
    let foosGoal, goal;
    let pw1, pw2, pl1, pl2;
    let gamePlayers = {}, gameTeams = {};

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
            ratingDelta: foosGame.data.winners[0].ratingDiff || 0
        };
        gamePlayers[playerContentToNodeId[pw2]] = {
            playerId: playerContentToNodeId[pw2],
            score: foosGame.data.winners[1].score || 0,
            scoreAgainst: foosGame.data.winners[1].against || 0,
            side: 'red',
            winner: true,
            ratingDelta: foosGame.data.winners[1].ratingDiff || 0
        };
        gamePlayers[playerContentToNodeId[pl1]] = {
            playerId: playerContentToNodeId[pl1],
            score: foosGame.data.losers[0].score || 0,
            scoreAgainst: foosGame.data.losers[0].against || 0,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.losers[0].ratingDiff || 0
        };
        gamePlayers[playerContentToNodeId[pl2]] = {
            playerId: playerContentToNodeId[pl2],
            score: foosGame.data.losers[1].score || 0,
            scoreAgainst: foosGame.data.losers[1].against || 0,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.losers[1].ratingDiff || 0
        };

        storeLib.refresh();
        let teamNodeW = storeLib.getTeamByPlayerIds(playerContentToNodeId[pw1], playerContentToNodeId[pw2]);
        teamNodeW = teamNodeW ? teamNodeW._id : null;
        if (!teamNodeW) {
            teamNodeW = createTeamWithPlayers(playerContentToNodeId[pw1], playerContentToNodeId[pw2]);
        }
        let teamNodeL = storeLib.getTeamByPlayerIds(playerContentToNodeId[pl1], playerContentToNodeId[pl2]);
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
            ratingDelta: foosGame.data.winnerTeamRatingDiff || 0
        };
        gameTeams[teamNodeL] = {
            teamId: teamNodeL,
            score: gamePlayers[playerContentToNodeId[pl1]].score + gamePlayers[playerContentToNodeId[pl2]].score,
            scoreAgainst: gamePlayers[playerContentToNodeId[pl1]].scoreAgainst + gamePlayers[playerContentToNodeId[pl2]].scoreAgainst,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.loserTeamRatingDiff || 0
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
            ratingDelta: foosGame.data.winners.ratingDiff || 0
        };
        gamePlayers[playerContentToNodeId[pl1]] = {
            playerId: playerContentToNodeId[pl1],
            score: foosGame.data.losers.score,
            scoreAgainst: foosGame.data.losers.against,
            side: 'blue',
            winner: false,
            ratingDelta: foosGame.data.losers.ratingDiff || 0
        };
    }

    for (let g = 0, l = foosGame.data.goals && foosGame.data.goals.length; g < l; g++) {
        foosGoal = foosGame.data.goals[g];
        goal = {
            playerId: playerContentToNodeId[foosGoal.playerId],
            time: foosGoal.time,
            against: foosGoal.against
        };
        goals.push(goal);
    }

    let k, gamePlayerList = [], gameTeamList = [];
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

const createPlayer = function (foosPlayer) {
    let playerExist = storeLib.getPlayerByName(foosPlayer._name);
    if (playerExist) {
        log.warning('Player with name "' + foosPlayer._name + '" already exists, cannot be imported.');
        return;
    }

    let foosImg = foosPlayer.data.picture;
    let pictureContent, stream, mimeType;
    if (foosImg) {
        pictureContent = contentLib.get({
            key: foosImg,
            branch: 'draft'
        });
        if (pictureContent) {
            let attachName = pictureContent.data.media.attachment;
            stream = contentLib.getAttachmentStream({
                key: foosImg,
                name: attachName
            });
            if (stream) {
                mimeType = contentLib.getAttachments(foosImg)[attachName].mimeType;
            }
        }
    }

    let playerNode = storeLib.createPlayer({
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

const createTeam = function (foosTeam, playerContentToNodeId) {
    let teamExist = storeLib.getTeamByName(foosTeam._name);
    if (teamExist) {
        log.warning('Team with name "' + foosTeam._name + '" already exists, cannot be imported.');
        return;
    }

    let foosImg = foosTeam.data.picture;
    let pictureContent, stream, mimeType;
    if (foosImg) {
        pictureContent = contentLib.get({
            key: foosImg,
            branch: 'draft'
        });
        if (pictureContent) {
            let attachName = pictureContent.data.media.attachment;
            stream = contentLib.getAttachmentStream({
                key: foosImg,
                name: attachName
            });
            if (stream) {
                mimeType = contentLib.getAttachments(foosImg)[attachName].mimeType;
            }
        }
    }
    let players = [];
    players.push(playerContentToNodeId[foosTeam.data.playerIds[0]]);
    players.push(playerContentToNodeId[foosTeam.data.playerIds[1]]);

    let displayName = foosTeam.displayName.replace(/&|\?/g, "-");
    displayName = displayName.slice(-1) === '-' ? displayName.slice(0, -1) : displayName;
    let playerNode = storeLib.createTeam({
        name: displayName,
        description: foosTeam.data.description,
        imageStream: stream,
        imageType: mimeType,
        playerIds: players
    });
};

const createTeamWithPlayers = function (playerId1, playerId2) {
    let playerIds = [];
    playerIds.push(playerId1);
    playerIds.push(playerId2);

    let teamNode = storeLib.createTeam({
        description: '',
        playerIds: playerIds
    });
    return teamNode._id;
};

const findPlayerContentByName = function (playerContentName) {
    let results = contentLib.query({
        start: 0,
        count: 1,
        query: "_name = '" + playerContentName + "'",
        branch: "draft",
        contentTypes: [LEGACY_APP_NAME + ":player"]
    });

    return results.count > 0 ? results.hits[0] : null;
};

const findTeamContentByName = function (teamContentName) {
    let results = contentLib.query({
        start: 0,
        count: 1,
        query: "displayName = '" + teamContentName + "'",
        branch: "draft",
        contentTypes: [LEGACY_APP_NAME + ":team"]
    });

    return results.count > 0 ? results.hits[0] : null;
};
