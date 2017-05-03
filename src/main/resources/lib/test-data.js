var contextLib = require('/lib/xp/context');
var ioLib = require('/lib/xp/io');
var storeLib = require('/lib/office-league-store');
var ratingLib = require('/lib/office-league-rating');


exports.createTestData = function () {
    contextLib.run({
        user: {
            login: 'su',
            userStore: 'system'
        },
        principals: ["role:system.admin"]
    }, doCreateTestData);
};

function createPlayer(name, params) {
    log.info('test/createPlayer:' + JSON.stringify(params));
    log.info('test/createPlayer2:' + !!params.imageStream);
    var player = storeLib.getPlayerByName(name);
    if (!player) {
        params.name = name;
        player = storeLib.createPlayer(params);
    }
    return player;
}

function createTeam(playerId1, playerId2, params) {
    var team = storeLib.getTeamByPlayerIds(playerId1, playerId2);
    if (!team) {
        params.playerIds = [playerId1, playerId2];
        team = storeLib.createTeam(params);
    }
    return team;
}

function createLeague(name, params) {
    var league = storeLib.getLeagueByName(name);
    if (!league) {
        params.name = name;
        league = storeLib.createLeague(params);
    }
    return league;

}

function doCreateTestData() {
    var superman = createPlayer('Superman', {
        userKey: 'user:system:su',
        description: 'Born Kal-El on the planet Krypton, before being rocketed to Earth to rule the Foosball leagues',
        handedness: 'right',
        fullname: 'Clark Kent',
        nationality: 'us',
        imageStream: ioLib.getResource('/import/lego/superman.jpg').getStream(),
        imageType: 'image/jpeg'
    });
    var batman = createPlayer('Batman', {
        userKey: 'user:system:batman',
        description: 'Wealthy American playboy, philanthropist, owner of Wayne Enterprises and foosballer',
        handedness: 'right',
        fullname: 'Bruce Wayne',
        nationality: 'us',
        imageStream: ioLib.getResource('/import/lego/batman.jpg').getStream(),
        imageType: 'image/jpeg'
    });
    var joker = createPlayer('The Joker', {
        userKey: 'user:system:joker',
        description: 'Criminal and foosball mastermind',
        handedness: 'right',
        fullname: 'The Joker',
        nationality: 'us',
        imageStream: ioLib.getResource('/import/lego/joker.jpg').getStream(),
        imageType: 'image/jpeg'
    });
    var harley = createPlayer('Harley Quinn', {
        userKey: 'user:system:harley',
        description: 'Frequent accomplice,lover and foosball teammate of the Joker',
        handedness: 'right',
        fullname: 'Harleen Frances Quinzel',
        nationality: 'us',
        imageStream: ioLib.getResource('/import/lego/harley.jpg').getStream(),
        imageType: 'image/jpeg'
    });

    var batmanSupermanTeam = createTeam(batman._id, superman._id, {
        description: 'Batman & Superman',
        imageStream: ioLib.getResource('/import/lego/superman-batman.jpg').getStream(),
        imageType: 'image/jpeg'
    });
    var jokerHarleyTeam = createTeam(joker._id, harley._id, {
        description: 'The Joker & Harley'
    });

    var league = createLeague('Justice League', {
        description: 'Assemblage of superheroes who join together to defeat evil foosball players',
        sport: 'foos',
        adminPlayerIds: [superman._id],
        imageStream: ioLib.getResource('/import/lego/league.jpg').getStream(),
        imageType: 'image/jpeg'
    });

    storeLib.joinPlayerLeague(league._id, superman._id);
    storeLib.joinPlayerLeague(league._id, batman._id);
    storeLib.joinPlayerLeague(league._id, joker._id);
    storeLib.joinPlayerLeague(league._id, harley._id);
    storeLib.joinTeamLeague(league._id, batmanSupermanTeam._id);
    storeLib.joinTeamLeague(league._id, jokerHarleyTeam._id);

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
            var scorer = [player1Id, player2Id, player3Id, player4Id][randomP];
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

        var game = storeLib.createGame({
            leagueId: league._id,
            finished: true,
            time: new Date().toISOString(),
            points: points,
            gamePlayers: gamePlayers,
            gameTeams: gameTeams
        });

        storeLib.refresh();
        var playerIds = game.gamePlayers.map(function (gp) {
            return gp.playerId;
        });
        var teamIds = game.gameTeams.map(function (gp) {
            return gp.teamId;
        });
        var leaguePlayers = storeLib.getLeaguePlayersByLeagueIdAndPlayerIds(game.leagueId, playerIds);
        var leagueTeams = storeLib.getLeagueTeamsByLeagueIdAndTeamIds(game.leagueId, teamIds);
        ratingLib.calculateGameRatings(game, leaguePlayers.hits, leagueTeams.hits);
        for (var j = 0; j < game.gamePlayers.length; j++) {
            storeLib.updatePlayerLeagueRating(game.leagueId, game.gamePlayers[j].playerId, game.gamePlayers[j].ratingDelta);
        }
        for (var k = 0; k < game.gameTeams.length; k++) {
            storeLib.updateTeamLeagueRating(game.leagueId, game.gameTeams[k].teamId, game.gameTeams[k].ratingDelta);
        }
        storeLib.updateGame({
            gameId: game._id,
            finished: true,
            gamePlayers: game.gamePlayers,
            gameTeams: game.gameTeams,
            points: game.points
        });

        game = storeLib.getGameById(game._id);

        var commentId = storeLib.createComment({
            gameId: game._id,
            author: player1Id,
            text: 'Game comment'
        });

        log.info('Game created');
    };

    for (var g = 0; g < 2; g++) {
        createRandomGame(superman._id, batman._id, joker._id, harley._id, batmanSupermanTeam._id, jokerHarleyTeam._id);
    }
};