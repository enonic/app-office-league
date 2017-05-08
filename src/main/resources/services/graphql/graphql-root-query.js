var graphQlLib = require('/lib/graphql');
var graphQlObjectTypesLib = require('./graphql-object-types');
var storeLib = require('office-league-store');

exports.rootQueryType = graphQlLib.createObjectType({
    name: 'Query',
    fields: {
        player: {
            type: graphQlObjectTypesLib.playerType,
            args: {
                id: graphQlLib.GraphQLID,
                name: graphQlLib.GraphQLString,
                userKey: graphQlLib.GraphQLString
            },
            resolve: function (env) {
                var id = env.args.id;
                var name = env.args.name;
                var userKey = env.args.userKey;
                if (id) {
                    return storeLib.getPlayerById(id);
                } else if (name) {
                    return storeLib.getPlayerByName(name);
                } else if (userKey) {
                    return storeLib.getPlayerByUserKey(userKey);
                }
                throw "[id], [name] or [userKey] must be specified";
            }
        },
        players: {
            type: graphQlLib.list(graphQlObjectTypesLib.playerType),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt,
                ids: graphQlLib.list(graphQlLib.GraphQLID),
                search: graphQlLib.GraphQLString
            },
            resolve: function (env) {
                var offset = env.args.offset;
                var first = env.args.first;
                var ids = env.args.ids;
                var search = env.args.search;
                if (ids) {
                    return storeLib.getPlayersById(ids);
                } else if (search) {
                    return storeLib.findPlayers(search, offset, first).hits;
                } else {
                    return storeLib.getPlayers(offset, first).hits;
                }
            }
        },
        playersConnection: {
            type: graphQlObjectTypesLib.playerConnectionType,
            args: {
                after: graphQlLib.GraphQLInt, //TODO Change for base64
                first: graphQlLib.GraphQLInt,
                search: graphQlLib.GraphQLString
            },
            resolve: function (env) {
                var after = env.args.after;
                var first = env.args.first;
                var search = env.args.search;
                if (search) {
                    return storeLib.findPlayers(search, after ? (after + 1) : 0, first);
                } else {
                    return storeLib.getPlayers(after ? (after + 1) : 0, first);
                }
            }
        },
        team: {
            type: graphQlObjectTypesLib.teamType,
            args: {
                id: graphQlLib.GraphQLID,
                name: graphQlLib.GraphQLString
            },
            resolve: function (env) {
                var id = env.args.id;
                var name = env.args.name;
                if (id) {
                    return storeLib.getTeamById(id);
                } else if (name) {
                    return storeLib.getTeamByName(name);
                }
                return null;
            }
        },
        teams: {
            type: graphQlLib.list(graphQlObjectTypesLib.teamType),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt,
                ids: graphQlLib.list(graphQlLib.GraphQLID),
                search: graphQlLib.GraphQLString
            },
            resolve: function (env) {
                var offset = env.args.offset;
                var first = env.args.first;
                var ids = env.args.ids;
                var search = env.args.search;
                if (ids) {
                    return storeLib.getTeamsById(ids);
                } else if (search) {
                    return storeLib.findTeams(search, offset, first).hits;
                } else {
                    return storeLib.getTeams(offset, first).hits;
                }
            }
        },
        teamsConnection: {
            type: graphQlObjectTypesLib.teamConnectionType,
            args: {
                after: graphQlLib.GraphQLInt, //TODO Change for base64
                first: graphQlLib.GraphQLInt,
                search: graphQlLib.GraphQLString
            },
            resolve: function (env) {
                var after = env.args.after;
                var first = env.args.first;
                var search = env.args.search;
                if (search) {
                    return storeLib.findTeams(search, after ? (after + 1) : 0, first);
                } else {
                    return storeLib.getTeams(after ? (after + 1) : 0, first);
                }
            }
        },
        games: {
            type: graphQlLib.list(graphQlObjectTypesLib.gameType),
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt,
                finished: graphQlLib.GraphQLBoolean
            },
            resolve: function (env) {
                var leagueId = env.args.leagueId;
                var offset = env.args.offset;
                var first = env.args.first;
                var finished = env.args.finished;
                return storeLib.getGamesByLeagueId(leagueId, offset, first, finished).hits;
            }
        },
        gamesConnection: {
            type: graphQlObjectTypesLib.gameConnectionType,
            args: {
                after: graphQlLib.GraphQLInt, //TODO Change for base64
                first: graphQlLib.GraphQLInt,
                leagueName: graphQlLib.GraphQLString,
                playerName: graphQlLib.GraphQLString,
                teamName: graphQlLib.GraphQLString,
                finished: graphQlLib.GraphQLBoolean,
            },
            resolve: function (env) {
                var after = env.args.after;
                var first = env.args.first;
                var leagueName = env.args.leagueName;
                var playerName = env.args.playerName;
                var teamName = env.args.teamName;
                var finished = !!env.args.finished;

                if (leagueName) {
                    var league = storeLib.getLeagueByName(leagueName);
                    if (league) {
                        return storeLib.getGamesByLeagueId(league._id, after ? (after + 1) : 0, first, finished);
                    }
                } else if (playerName) {
                    var player = storeLib.getPlayerByName(playerName);
                    if (player) {
                        return storeLib.getGamesByPlayerId(player._id, after ? (after + 1) : 0, first); //TODO Finished or not?
                    }
                } else if (teamName) {
                    var team = storeLib.getTeamByName(teamName);
                    if (team) {
                        return storeLib.getGamesByTeamId(team._id, after ? (after + 1) : 0, first); //TODO Finished or not?
                    }
                }

                return {
                    total: 0,
                    count: 0,
                    hits: []
                };
            }
        },
        activeGames: {
            type: graphQlLib.list(graphQlObjectTypesLib.gameType),
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt
            },
            resolve: function (env) {
                var leagueId = env.args.leagueId;
                var offset = env.args.offset;
                var first = env.args.first;
                return storeLib.getActiveGamesByLeagueId(leagueId, offset, first).hits;
            }
        },
        game: {
            type: graphQlObjectTypesLib.gameType,
            args: {
                id: graphQlLib.nonNull(graphQlLib.GraphQLID)
            },
            resolve: function (env) {
                var gameId = env.args.id;
                return storeLib.getGameById(gameId);
            }
        },
        leaguePlayers: {
            type: graphQlLib.list(graphQlObjectTypesLib.leaguePlayerType),
            args: {
                leagueId: graphQlLib.GraphQLID,
                playerId: graphQlLib.GraphQLID,
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt
            },
            resolve: function (env) {
                var leagueId = env.args.leagueId;
                var playerId = env.args.playerId;
                var offset = env.args.offset;
                var first = env.args.first;
                if (leagueId) {
                    return storeLib.getLeaguePlayersByLeagueId(leagueId, offset, first).hits;
                } else if (playerId) {
                    return storeLib.getLeaguePlayersByPlayerId(playerId, offset, first).hits;
                }
                throw "[leagueId] or [playerId] must be specified";
            }
        },
        leagueTeams: {
            type: graphQlLib.list(graphQlObjectTypesLib.leagueTeamType),
            args: {
                leagueId: graphQlLib.GraphQLID,
                teamId: graphQlLib.GraphQLID,
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt
            },
            resolve: function (env) {
                var leagueId = env.args.leagueId;
                var teamId = env.args.teamId;
                var offset = env.args.offset;
                var first = env.args.first;
                if (leagueId) {
                    return storeLib.getLeagueTeamsByLeagueId(leagueId, offset, first).hits;
                } else if (playerId) {
                    return storeLib.getLeagueTeamsByTeamId(teamId, offset, first).hits;
                }
                throw "[leagueId] or [teamId] must be specified";
            }
        },
        league: {
            type: graphQlObjectTypesLib.leagueType,
            args: {
                id: graphQlLib.GraphQLID,
                name: graphQlLib.GraphQLString
            },
            resolve: function (env) {
                var id = env.args.id;
                var name = env.args.name;
                if (id) {
                    return storeLib.getLeagueById(id);
                } else if (name) {
                    return storeLib.getLeagueByName(name);
                }
                throw "[id] or [name] must be specified";
            }
        },
        leagues: {
            type: graphQlLib.list(graphQlObjectTypesLib.leagueType),
            args: {
                playerId: graphQlLib.GraphQLID,
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt,
                ids: graphQlLib.list(graphQlLib.GraphQLID)
            },
            resolve: function (env) {
                var playerId = env.args.playerId;
                var offset = env.args.offset;
                var first = env.args.first;
                var ids = env.args.ids;
                if (playerId) {
                    return storeLib.getLeaguesByPlayerId(playerId, offset, first).hits;
                } else if (ids) {
                    return storeLib.getLeaguesById(ids);
                } else {
                    return storeLib.getLeagues(offset, first).hits;
                }
            }
        }
    }
});