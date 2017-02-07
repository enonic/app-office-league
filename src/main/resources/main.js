var initLib = require('/lib/office-league-init');
var storeLib = require('/lib/office-league-store');
var ioLib = require('/lib/xp/io');

log.info('Application ' + app.name + ' started');

initLib.initialize();

var playerImage = ioLib.getResource('/import/images/player.png');
var teamImage = ioLib.getResource('/import/images/xp.png');

var league = storeLib.getLeagueByName('My League');
if (!league) {
    league = storeLib.createLeague({
        name: 'My League',
        description: 'Test league',
        sport: 'foos'
    });
    log.info('League created');
}
var player1 = storeLib.getPlayerByName('Player1');
if (!player1) {
    player1 = storeLib.createPlayer({
        name: 'Player1',
        description: 'Player One',
        handedness: 'left',
        nickname: 'The Player',
        nationality: 'us',
        imageStream: playerImage.getStream(),
        imageType: 'image/png'
    });
    log.info('Player 1 created');
}
var player2 = storeLib.getPlayerByName('Player2');
if (!player2) {
    player2 = storeLib.createPlayer({
        name: 'Player2',
        description: 'Player Two',
        handedness: 'right',
        nickname: 'The Other Player',
        nationality: 'no',
        imageStream: playerImage.getStream(),
        imageType: 'image/png'
    });
    log.info('Player 2 created');
}
var player3 = storeLib.getPlayerByName('Player3');
if (!player3) {
    player3 = storeLib.createPlayer({
        name: 'Player3',
        description: 'Player Three',
        handedness: 'left',
        nickname: 'Some Other Player',
        nationality: 'ru',
        imageStream: playerImage.getStream(),
        imageType: 'image/png'
    });
    log.info('Player 3 created');
}
var player4 = storeLib.getPlayerByName('Player4');
if (!player4) {
    player4 = storeLib.createPlayer({
        name: 'Player4',
        description: 'Player Four',
        handedness: 'right',
        nickname: 'And Another Player',
        nationality: 'fr',
        imageStream: playerImage.getStream(),
        imageType: 'image/png'
    });
    log.info('Player 4 created');
}

var teamA = storeLib.getTeamByName('A Team');
if (!teamA) {
    teamA = storeLib.createTeam({
        name: 'A Team',
        description: 'The A Team',
        playerIds: [player1._id, player2._id],
        imageStream: teamImage.getStream(),
        imageType: 'image/png'
    });
    log.info('Team A created');
}

var teamB = storeLib.getTeamByName('B Team');
if (!teamB) {
    teamB = storeLib.createTeam({
        name: 'B Team',
        description: 'The B Team',
        playerIds: [player3._id, player4._id],
        imageStream: teamImage.getStream(),
        imageType: 'image/png'
    });
    log.info('Team B created');
}


var createRandomGame = function (player1Id, player2Id, player3Id, player4Id, teamAId, teamBId) {
    var points = [];
    var gamePlayer1 = {
        playerId: player1Id,
        score: 0,
        scoreAgainst: 0,
        side: 'red',
        winner: false,
        ratingDelta: 0
    };
    var gamePlayer2 = {
        playerId: player2Id,
        score: 0,
        scoreAgainst: 0,
        side: 'red',
        winner: false,
        ratingDelta: 0
    };
    var gamePlayer3 = {
        playerId: player3Id,
        score: 0,
        scoreAgainst: 0,
        side: 'blue',
        winner: false,
        ratingDelta: 0
    };
    var gamePlayer4 = {
        playerId: player4Id,
        score: 0,
        scoreAgainst: 0,
        side: 'blue',
        winner: false,
        ratingDelta: 0
    };
    var gameTeamA = {
        teamId: teamAId,
        score: 0,
        scoreAgainst: 0,
        side: 'red',
        winner: false,
        ratingDelta: 0
    };
    var gameTeamB = {
        teamId: teamBId,
        score: 0,
        scoreAgainst: 0,
        side: 'blue',
        winner: false,
        ratingDelta: 0
    };

    var gamePlayers = [gamePlayer1, gamePlayer2, gamePlayer3, gamePlayer4];
    var gameTeams = [gameTeamA, gameTeamB], t = 0;
    while (true) {
        var randomP = Math.floor(Math.random() * 4);
        var scorer = [player1._id, player2._id, player3._id, player4._id][randomP];
        var against = Math.random() > .9;
        t = t + Math.floor(Math.random() * 50);
        points.push({
            time: t,
            playerId: scorer,
            against: against
        });
        if (against) {
            gamePlayers[randomP].scoreAgainst += 1;
            gameTeams[Math.floor(randomP / 2)].scoreAgainst += 1;
        } else {
            gamePlayers[randomP].score += 1;
            gameTeams[Math.floor(randomP / 2)].score += 1;
        }

        var scoreA = gameTeamA.score + gameTeamB.scoreAgainst;
        var scoreB = gameTeamB.score + gameTeamA.scoreAgainst;
        if (scoreA >= 10 && scoreA - scoreB >= 2) {
            gameTeamA.winner = true;
            gamePlayer1.winner = true;
            gamePlayer2.winner = true;
            break;
        } else if (scoreB >= 10 && scoreB - scoreA >= 2) {
            gameTeamB.winner = true;
            gamePlayer3.winner = true;
            gamePlayer4.winner = true;
            break;
        }
    }

    storeLib.createGame({
        leagueId: league._id,
        finished: true,
        time: new Date().toISOString(),
        points: points,
        gamePlayers: gamePlayers,
        gameTeams: gameTeams
    });
    log.info('Game created');
};

for (var g = 0; g < 10; g++) {
    createRandomGame(player1._id, player2._id, player3._id, player4._id, teamA._id, teamB._id);
}

__.disposer(function () {
    log.info('Application ' + app.name + ' stopped');
});
