var graphQlLib = require('graphql');
var graphQlEnumsLib = require('./graphql-enums');
var graphQlObjectTypesLib = require('./graphql-object-types');
var graphQlInputTypesLib = require('./graphql-input-types');
var storeLib = require('office-league-store');
var authLib = require('/lib/xp/auth');

exports.rootMutationType = graphQlLib.createObjectType({
    name: 'Mutation',
    fields: {
        createLeague: {
            type: graphQlObjectTypesLib.leagueType,
            args: {
                name: graphQlLib.nonNull(graphQlLib.GraphQLString),
                sport: graphQlLib.nonNull(graphQlEnumsLib.sportEnumType),
                description: graphQlLib.GraphQLString,
                config: graphQlLib.GraphQLString,//TODO
                adminPlayerIds: graphQlLib.list(graphQlLib.GraphQLID)
            },
            data: function (env) {
                var createdLeague = storeLib.createLeague({
                    name: env.args.name,
                    sport: env.args.sport,
                    description: env.args.description,
                    config: env.args.config ? JSON.parse(env.args.config) : {}, //TODO
                    adminPlayerIds: env.args.adminPlayerIds
                });
                storeLib.refresh();
                return createdLeague;
            }
        },
        updateLeague: {
            type: graphQlObjectTypesLib.leagueType,
            args: {
                id: graphQlLib.nonNull(graphQlLib.GraphQLID),
                name: graphQlLib.GraphQLString,
                description: graphQlLib.GraphQLString,
                config: graphQlLib.GraphQLString,//TODO
                adminPlayerIds: graphQlLib.list(graphQlLib.GraphQLID)
            },
            data: function (env) {
                var updatedLeague = storeLib.updateLeague({
                    leagueId: env.args.id,
                    name: env.args.name,
                    description: env.args.description,
                    config: env.args.config ? JSON.parse(env.args.config) : {}, //TODO
                    adminPlayerIds: env.args.adminPlayerIds
                });
                storeLib.refresh();
                return updatedLeague;
            }
        },
        deleteLeague: {
            type: graphQlLib.GraphQLID,
            args: {
                name: graphQlLib.nonNull(graphQlLib.GraphQLString)
            },
            data: function (env) {
                var deletedId = storeLib.deleteLeagueByName(env.args.name);
                storeLib.refresh();
                return deletedId;
            }
        },
        createPlayer: {
            type: graphQlObjectTypesLib.playerType,
            args: {
                name: graphQlLib.nonNull(graphQlLib.GraphQLString),
                nickname: graphQlLib.GraphQLString,
                nationality: graphQlLib.GraphQLString, //TODO
                handedness: graphQlEnumsLib.handednessEnumType,
                description: graphQlLib.GraphQLString
            },
            data: function (env) {
                var userKey = getCurrentUserKey();
                if (!userKey) {
                    throw "Player cannot be created, no logged in user to link to.";
                }
                if (isUserLinkedToPlayer(userKey)) {
                    throw "Player cannot be created, logged in user already linked to another player.";
                }
                var createdPlayer = storeLib.createPlayer({
                    name: env.args.name,
                    nickname: env.args.nickname,
                    nationality: env.args.nationality,
                    handedness: env.args.handedness,
                    description: env.args.description,
                    userKey: userKey
                });
                storeLib.refresh();
                return createdPlayer;
            }
        },
        updatePlayer: {
            type: graphQlObjectTypesLib.playerType,
            args: {
                id: graphQlLib.nonNull(graphQlLib.GraphQLID),
                name: graphQlLib.GraphQLString,
                nickname: graphQlLib.GraphQLString,
                nationality: graphQlLib.GraphQLString, //TODO
                handedness: graphQlEnumsLib.handednessEnumType,
                description: graphQlLib.GraphQLString
            },
            data: function (env) {
                var updatedPlayer = storeLib.updatePlayer({
                    playerId: env.args.id,
                    name: env.args.name,
                    nickname: env.args.nickname,
                    nationality: env.args.nationality,
                    handedness: env.args.handedness,
                    description: env.args.description
                });
                storeLib.refresh();
                return updatedPlayer;
            }
        },
        createTeam: {
            type: graphQlObjectTypesLib.teamType,
            args: {
                name: graphQlLib.nonNull(graphQlLib.GraphQLString),
                description: graphQlLib.GraphQLString,
                playerIds: graphQlLib.nonNull(graphQlLib.list(graphQlLib.GraphQLID))
            },
            data: function (env) {
                var createdTeam = storeLib.createTeam({
                    name: env.args.name,
                    description: env.args.description,
                    playerIds: env.args.playerIds
                });
                storeLib.refresh();
                return createdTeam;
            }
        },
        updateTeam: {
            type: graphQlObjectTypesLib.teamType,
            args: {
                id: graphQlLib.nonNull(graphQlLib.GraphQLID),
                name: graphQlLib.GraphQLString,
                description: graphQlLib.GraphQLString
            },
            data: function (env) {
                var updatedTeam = storeLib.updateTeam({
                    teamId: env.args.id,
                    name: env.args.name,
                    description: env.args.description
                });
                storeLib.refresh();
                return updatedTeam;
            }
        },
        joinPlayerLeague: {
            type: graphQlObjectTypesLib.leaguePlayerType,
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                playerId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                rating: graphQlLib.GraphQLInt
            },
            data: function (env) {
                var createdLeaguePlayer = storeLib.joinPlayerLeague(env.args.leagueId, env.args.playerId, env.args.rating);
                storeLib.refresh();
                return createdLeaguePlayer;
            }
        },
        updatePlayerLeagueRating: {
            type: graphQlObjectTypesLib.leaguePlayerType,
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                playerId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                ratingDelta: graphQlLib.nonNull(graphQlLib.GraphQLInt)
            },
            data: function (env) {
                var updatedLeaguePlayer = storeLib.updatePlayerLeagueRating(env.args.leagueId, env.args.playerId, env.args.ratingDelta);
                storeLib.refresh();
                return updatedLeaguePlayer;
            }
        },
        joinTeamLeague: {
            type: graphQlObjectTypesLib.leagueTeamType,
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                teamId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                rating: graphQlLib.GraphQLInt
            },
            data: function (env) {
                var createdLeagueTeam = storeLib.joinTeamLeague(env.args.leagueId, env.args.teamId, env.args.rating);
                storeLib.refresh();
                return createdLeagueTeam;
            }
        },
        updateTeamLeagueRating: {
            type: graphQlObjectTypesLib.leagueTeamType,
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                teamId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                ratingDelta: graphQlLib.nonNull(graphQlLib.GraphQLInt)
            },
            data: function (env) {
                var updatedLeagueTeam = storeLib.updateTeamLeagueRating(env.args.leagueId, env.args.teamId, env.args.ratingDelta);
                storeLib.refresh();
                return updatedLeagueTeam;
            }
        },
        createGame: {
            type: graphQlObjectTypesLib.gameType,
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                points: graphQlLib.list(graphQlInputTypesLib.pointCreationType),
                gamePlayers: graphQlLib.nonNull(graphQlLib.list(graphQlInputTypesLib.gamePlayerCreationType))
            },
            data: function (env) {
                var createGameParams = storeLib.generateCreateGameParams({
                    leagueId: env.args.leagueId,
                    points: env.args.points || [],
                    gamePlayers: env.args.gamePlayers
                });
                var createdGame = storeLib.createGame(createGameParams);
                storeLib.refresh();

                if (createGameParams.finished) {
                    // update ranking
                    var game = storeLib.getGameById(createdGame._id);
                    storeLib.updateGameRanking(game);
                    storeLib.refresh();
                    storeLib.logGameRanking(game);
                }
                return createdGame;
            }
        },
        updateGame: {
            type: graphQlObjectTypesLib.gameType,
            args: {
                gameId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                points: graphQlLib.list(graphQlInputTypesLib.pointCreationType),
                gamePlayers: graphQlLib.nonNull(graphQlLib.list(graphQlInputTypesLib.gamePlayerCreationType))
            },
            data: function (env) {
                var createGameParams = storeLib.generateCreateGameParams({
                    leagueId: '',
                    points: env.args.points || [],
                    gamePlayers: env.args.gamePlayers
                });
                storeLib.updateGame({
                    gameId: env.args.gameId,
                    finished: createGameParams.finished,
                    gamePlayers: createGameParams.gamePlayers,
                    gameTeams: createGameParams.gameTeams,
                    points: createGameParams.points
                });
                storeLib.refresh();

                if (createGameParams.finished) {
                    // update ranking
                    var game = storeLib.getGameById(env.args.gameId);
                    storeLib.updateGameRanking(game);
                    storeLib.refresh();
                    storeLib.logGameRanking(game);
                }
                return storeLib.getGameById(env.args.gameId);
            }
        },
        deleteGame: {
            type: graphQlLib.GraphQLID,
            args: {
                id: graphQlLib.nonNull(graphQlLib.GraphQLID)
            },
            data: function (env) {
                var deletedId = storeLib.deleteGameById(env.args.id);
                storeLib.refresh();
                return deletedId;
            }
        },
        createComment: {
            type: graphQlObjectTypesLib.commentType,
            args: {
                gameId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                author: graphQlLib.nonNull(graphQlLib.GraphQLID),
                text: graphQlLib.GraphQLString
            },
            data: function (env) {
                var playerId = getCurrentPlayerId();
                if (playerId !== env.args.author) {
                    throw "Comment author is not the logged in user";
                }
                var createdComment = storeLib.createComment({
                    gameId: env.args.gameId,
                    author: env.args.author,
                    text: env.args.text
                });
                storeLib.refresh();
                return createdComment;
            }
        }
    }
});

var getCurrentPlayerId = function () {
    var user = authLib.getUser();
    if (!user) {
        return null;
    }
    var player = storeLib.getPlayerByUserKey(user.key);
    return player && player._id;
};

var getCurrentUserKey = function () {
    var user = authLib.getUser();
    return user ? user.key : null;
};

var isUserLinkedToPlayer = function (userKey) {
    var player = storeLib.getPlayerByUserKey(userKey);
    return !!player;
};
