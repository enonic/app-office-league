var graphQlLib = require('graphql');
var graphQlObjectTypesLib = require('./graphql-object-types');
var storeLib = require('office-league-store');

exports.rootQueryType = graphQlLib.createObjectType({
    name: 'RootQuery',
    fields: {
        player: {
            type: graphQlObjectTypesLib.playerType,
            args: {
                id: graphQlLib.GraphQLID,
                name: graphQlLib.GraphQLString,
                userKey: graphQlLib.GraphQLString
            },
            data: function (env) {
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
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt,
                ids: graphQlLib.list(graphQlLib.GraphQLID)
            },
            data: function (env) {
                var start = env.args.start;
                var count = env.args.count;
                var ids = env.args.ids;
                if (ids) {
                    return storeLib.getPlayersById(ids);
                } else {
                    return storeLib.getPlayers(start, count).hits;
                }
            }
        },
        team: {
            type: graphQlObjectTypesLib.teamType,
            args: {
                id: graphQlLib.GraphQLID,
                name: graphQlLib.GraphQLString
            },
            data: function (env) {
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
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt,
                ids: graphQlLib.list(graphQlLib.GraphQLID)
            },
            data: function (env) {
                var start = env.args.start;
                var count = env.args.count;
                var ids = env.args.ids;
                if (ids) {
                    return storeLib.getTeamsById(ids);
                } else {
                    return storeLib.getTeams(start, count).hits;
                }
            }
        },
        games: {
            type: graphQlLib.list(graphQlObjectTypesLib.gameType),
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                var leagueId = env.args.leagueId;
                var start = env.args.start;
                var count = env.args.count;
                return storeLib.getGamesByLeagueId(leagueId, start, count).hits;
            }
        },
        game: {
            type: graphQlObjectTypesLib.gameType,
            args: {
                id: graphQlLib.nonNull(graphQlLib.GraphQLID)
            },
            data: function (env) {
                var gameId = env.args.id;
                return storeLib.getGameById(gameId);
            }
        },
        leaguePlayers: {
            type: graphQlLib.list(graphQlObjectTypesLib.leaguePlayerType),
            args: {
                leagueId: graphQlLib.GraphQLID,
                playerId: graphQlLib.GraphQLID,
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                var leagueId = env.args.leagueId;
                var playerId = env.args.playerId;
                var start = env.args.start;
                var count = env.args.count;
                if (leagueId) {
                    return storeLib.getLeaguePlayersByLeagueId(leagueId, start, count).hits;
                } else if (playerId) {
                    return storeLib.getLeaguePlayersByPlayerId(playerId, start, count).hits;
                }
                throw "[leagueId] or [playerId] must be specified";
            }
        },
        leagueTeams: {
            type: graphQlLib.list(graphQlObjectTypesLib.leagueTeamType),
            args: {
                leagueId: graphQlLib.GraphQLID,
                teamId: graphQlLib.GraphQLID,
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                var leagueId = env.args.leagueId;
                var teamId = env.args.teamId;
                var start = env.args.start;
                var count = env.args.count;
                if (leagueId) {
                    return storeLib.getLeagueTeamsByLeagueId(leagueId, start, count).hits;
                } else if (playerId) {
                    return storeLib.getLeagueTeamsByTeamId(teamId, start, count).hits;
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
            data: function (env) {
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
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                var playerId = env.args.playerId;
                var start = env.args.start;
                var count = env.args.count;
                if (playerId) {
                    return storeLib.getLeaguesByPlayerId(playerId, start, count).hits;
                } else {
                    return storeLib.getLeagues(start, count).hits;
                }
            }
        }
    }
});