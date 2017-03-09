var graphQlLib = require('graphql');
var graphQlEnumsLib = require('./graphql-enums');
var graphQlObjectTypesLib = require('./graphql-object-types');
var graphQlInputTypesLib = require('./graphql-input-types');
var storeLib = require('office-league-store');

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
                return storeLib.createLeague({
                    name: env.args.name,
                    sport: env.args.sport,
                    description: env.args.description,
                    config: env.args.config ? JSON.parse(env.args.config) : {}, //TODO
                    adminPlayerIds: env.args.adminPlayerIds
                });
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
                return storeLib.createPlayer({
                    name: env.args.name,
                    nickname: env.args.nickname,
                    nationality: env.args.nationality,
                    handedness: env.args.handedness,
                    description: env.args.description
                });
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
                return storeLib.updatePlayer({
                    playerId: env.args.id,
                    name: env.args.name,
                    nickname: env.args.nickname,
                    nationality: env.args.nationality,
                    handedness: env.args.handedness,
                    description: env.args.description
                });
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
                return storeLib.createTeam({
                    name: env.args.name,
                    description: env.args.description,
                    playerIds: env.args.playerIds
                });
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
                return storeLib.updateTeam({
                    teamId: env.args.id,
                    name: env.args.name,
                    description: env.args.description
                });
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
                return storeLib.joinPlayerLeague(env.args.leagueId, env.args.playerId, env.args.rating);
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
                return storeLib.updatePlayerLeagueRating(env.args.leagueId, env.args.playerId, env.args.ratingDelta);
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
                return storeLib.joinTeamLeague(env.args.leagueId, env.args.teamId, env.args.rating);
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
                return storeLib.updateTeamLeagueRating(env.args.leagueId, env.args.teamId, env.args.ratingDelta);
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
                    // TODO update ranking
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
                    // TODO update ranking
                }
                return storeLib.getGameById(env.args.gameId);
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
                return storeLib.createComment({
                    gameId: env.args.gameId,
                    author: env.args.author,
                    text: env.args.text
                });
            }
        }
    }
});