var graphQlLib = require('graphql');
var graphQlEnumsLib = require('./graphql-enums');
var graphQlUtilLib = require('./graphql-util');
var graphQlConnectionLib = require('./graphql-connection');
var storeLib = require('office-league-store');

/* -----------------------------------------------------------------------
 * Interfaces
 ----------------------------------------------------------------------- */
var entityType = graphQlLib.createInterfaceType({
    name: 'Entity',
    description: 'Data entity. Contains a field id with a unique value',
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        }
    }
});

/* -----------------------------------------------------------------------
 * Object types
 ----------------------------------------------------------------------- */
exports.playerType = graphQlLib.createObjectType({
    name: 'Player',
    description: 'Domain representation of a player. A player has a link to a user',
    interfaces: [entityType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        userKey: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            data: function (env) {
                return env.source.userKey || '';
            }
        },
        name: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            data: function (env) {
                return env.source.name;
            }
        },
        nickname: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.nickname;
            }
        },
        nationality: {
            type: graphQlLib.GraphQLString, //TODO Change to enum
            data: function (env) {
                return env.source.nationality;
            }
        },
        handedness: {
            type: graphQlEnumsLib.handednessEnumType,
            data: function (env) {
                return env.source.handedness;
            }
        },
        description: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.description;
            }
        },
        teams: {
            type: graphQlLib.list(graphQlLib.reference('Team')),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getTeamsByPlayerId(env.source._id, env.args.offset, env.args.first).hits;
            }
        },
        teamsConnection: {
            type: graphQlLib.reference('TeamConnection'),
            args: {
                after: graphQlLib.GraphQLInt, //TODO Change for base64
                first: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getTeamsByPlayerId(env.source._id, env.args.after ? (env.args.after + 1) : 0, env.args.first);
            }
        },
        leaguePlayers: {
            type: graphQlLib.list(graphQlLib.reference('LeaguePlayer')),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getLeaguePlayersByPlayerId(env.source._id, env.args.offset, env.args.first).hits;
            }
        },
        gamePlayers: {
            type: graphQlLib.list(graphQlLib.reference('GamePlayer')),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getGamePlayersByPlayerId(env.source._id, env.args.offset, env.args.first).hits;
            }
        }
    }
});
exports.playerConnectionType = graphQlConnectionLib.createConnectionType('Player', exports.playerType);

exports.teamType = graphQlLib.createObjectType({
    name: 'Team',
    description: 'Domain representation of a team. A team is composed of two player',
    interfaces: [entityType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        name: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            data: function (env) {
                return env.source.name;
            }
        },
        description: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.description;
            }
        },
        players: {
            type: graphQlLib.list(exports.playerType),
            data: function (env) {
                return graphQlUtilLib.toArray(env.source.playerIds).map(function (playerId) {
                    return storeLib.getPlayerById(playerId);
                });
            }
        },
        leagueTeams: {
            type: graphQlLib.list(graphQlLib.reference('LeagueTeam')),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getLeagueTeamsByTeamId(env.source._id, env.args.offset, env.args.first).hits;
            }
        },
        gameTeams: {
            type: graphQlLib.list(graphQlLib.reference('GameTeam')),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getGameTeamsByTeamId(env.source._id, env.args.offset, env.args.first).hits;
            }
        }
    }
});
exports.teamConnectionType = graphQlConnectionLib.createConnectionType('Team', exports.teamType);

exports.gamePlayerType = graphQlLib.createObjectType({
    name: 'GamePlayer',
    description: 'Relation between a player and a game. ' +
                 'This relation means that a player is a part of a game. GamePlayer also contains statistics',
    interfaces: [entityType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        time: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.time;
            }
        },
        score: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return graphQlUtilLib.toInt(env.source.score, 0);
            }
        },
        scoreAgainst: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return graphQlUtilLib.toInt(env.source.scoreAgainst, 0);
            }
        },
        side: {
            type: graphQlEnumsLib.sideEnumType,
            data: function (env) {
                return env.source.side;
            }
        },
        winner: {
            type: graphQlLib.GraphQLBoolean,
            data: function (env) {
                return env.source.winner;
            }
        },
        ratingDelta: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return graphQlUtilLib.toInt(env.source.ratingDelta);
            }
        },
        player: {
            type: exports.playerType,
            data: function (env) {
                return storeLib.getPlayerById(env.source.playerId);
            }
        },
        game: {
            type: graphQlLib.reference('Game'),
            data: function (env) {
                return storeLib.getGameById(env.source.gameId);
            }
        }
    }
});

exports.gameTeamType = graphQlLib.createObjectType({
    name: 'GameTeam',
    description: 'Relation between a team and a game. ' +
                 'This relation means that a team is a part of a game. GameTeam also contains statistics',
    interfaces: [entityType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        time: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.time;
            }
        },
        score: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return graphQlUtilLib.toInt(env.source.score, 0);
            }
        },
        scoreAgainst: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return graphQlUtilLib.toInt(env.source.scoreAgainst, 0);
            }
        },
        side: {
            type: graphQlEnumsLib.sideEnumType,
            data: function (env) {
                return env.source.side;
            }
        },
        winner: {
            type: graphQlLib.GraphQLBoolean,
            data: function (env) {
                return env.source.winner;
            }
        },
        ratingDelta: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return graphQlUtilLib.toInt(env.source.ratingDelta);
            }
        },
        team: {
            type: exports.teamType,
            data: function (env) {
                return storeLib.getTeamById(env.source.teamId);
            }
        },
        game: {
            type: graphQlLib.reference('Game'),
            data: function (env) {
                return storeLib.getGameById(env.source.gameId);
            }
        }
    }
});

exports.pointType = graphQlLib.createObjectType({
    name: 'Point',
    description: 'Domain representation of a goal/point.',
    fields: {
        time: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLInt),
            data: function (env) {
                return graphQlUtilLib.toInt(env.source.time);
            }
        },
        against: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLBoolean),
            data: function (env) {
                return env.source.against;
            }
        },
        player: {
            type: graphQlLib.nonNull(exports.playerType),
            data: function (env) {
                return storeLib.getPlayerById(env.source.playerId);
            }
        }
    }
});

exports.commentType = graphQlLib.createObjectType({
    name: 'Comment',
    description: 'Domain representation of a user comment.',
    interfaces: [entityType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        text: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.text;
            }
        },
        author: {
            type: exports.playerType,
            data: function (env) {
                return storeLib.getPlayerById(env.source.author);
            }
        },
        likes: {
            type: graphQlLib.list(exports.playerType),
            data: function (env) {
                return graphQlUtilLib.toArray(env.source.likes).map(function (playerId) {
                    storeLib.getPlayerById(playerId)
                });
            }
        }
    }
});

exports.gameType = graphQlLib.createObjectType({
    name: 'Game',
    description: 'Domain representation of a game',
    interfaces: [entityType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        time: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.time;
            }
        },
        finished: {
            type: graphQlLib.GraphQLBoolean,
            data: function (env) {
                return env.source.finished;
            }
        },
        points: {
            type: graphQlLib.list(exports.pointType),
            data: function (env) {
                return graphQlUtilLib.toArray(env.source.points);
            }
        },
        comments: {
            type: graphQlLib.list(exports.commentType),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getCommentsByGameId(env.source._id, env.args.offset, env.args.first).hits;
            }
        },
        gamePlayers: {
            type: graphQlLib.list(exports.gamePlayerType),
            data: function (env) {
                return env.source.gamePlayers;
            }
        },
        gameTeams: {
            type: graphQlLib.list(exports.gameTeamType),
            data: function (env) {
                return env.source.gameTeams;
            }
        },
        league: {
            type: graphQlLib.reference('League'),
            data: function (env) {
                return storeLib.getLeagueById(env.source.leagueId);
            }
        }
    }
});

exports.leaguePlayerType = graphQlLib.createObjectType({
    name: 'LeaguePlayer',
    description: 'Relation between a player and a league. ' +
                 'This relation means that a player is a part of a league. LeaguePlayer also contains statistics',
    interfaces: [entityType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        rating: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return graphQlUtilLib.toInt(env.source.rating);
            }
        },
        ranking: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return graphQlUtilLib.toInt(storeLib.getRankingForPlayerLeague(env.source.playerId, env.source.leagueId));
            }
        },
        player: {
            type: exports.playerType,
            data: function (env) {
                return storeLib.getPlayerById(env.source.playerId);
            }
        },
        league: {
            type: graphQlLib.reference('League'),
            data: function (env) {
                return storeLib.getLeagueById(env.source.leagueId);
            }
        }
    }
});
exports.leaguePlayerConnectionType = graphQlConnectionLib.createConnectionType('LeaguePlayer', exports.leaguePlayerType);

exports.leagueTeamType = graphQlLib.createObjectType({
    name: 'LeagueTeam',
    description: 'Relation between a team and a league. ' +
                 'This relation means that a team is a part of a league. LeagueTeam also contains statistics',
    interfaces: [entityType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        rating: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return graphQlUtilLib.toInt(env.source.rating);
            }
        },
        ranking: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return graphQlUtilLib.toInt(storeLib.getRankingForTeamLeague(env.source.teamId, env.source.leagueId));
            }
        },
        team: {
            type: exports.teamType,
            data: function (env) {
                return storeLib.getTeamById(env.source.teamId);
            }
        },
        league: {
            type: graphQlLib.reference('League'),
            data: function (env) {
                return storeLib.getLeagueById(env.source.leagueId);
            }
        }
    }
});
exports.leagueTeamConnectionType = graphQlConnectionLib.createConnectionType('LeagueTeam', exports.leagueTeamType);

exports.leagueType = graphQlLib.createObjectType({
    name: 'League',
    description: 'Domain representation of a league. A league contains games. Players can join 0..* leagues and indirectly their teams.',
    interfaces: [entityType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        name: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            data: function (env) {
                return env.source.name;
            }
        },
        sport: {
            type: graphQlLib.nonNull(graphQlEnumsLib.sportEnumType),
            data: function (env) {
                return env.source.sport;
            }
        },
        description: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.description;
            }
        },
        config: {
            type: graphQlLib.GraphQLString, //TODO Is it? Is there a unstructured type?
            data: function (env) {
                return JSON.stringify(env.source.config);
            }
        },
        adminPlayers: {
            type: graphQlLib.list(exports.playerType),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return graphQlUtilLib.toArray(env.source.adminPlayerIds).map(function (adminPlayerId) {
                    return storeLib.getPlayerById(adminPlayerId); //TODO Improve
                });
            }
        },
        isAdmin: {
            type: graphQlLib.GraphQLBoolean,
            args: {
                playerId: graphQlLib.nonNull(graphQlLib.GraphQLID)
            },
            data: function (env) {
                return graphQlUtilLib.toArray(env.source.adminPlayerIds).indexOf(env.args.playerId) > -1;
            }
        },
        leaguePlayer: {
            type: exports.leaguePlayerType,
            args: {
                playerId: graphQlLib.nonNull(graphQlLib.GraphQLID)
            },
            data: function (env) {
                return storeLib.getLeaguePlayerByLeagueIdAndPlayerId(env.source._id, env.args.playerId);
            }
        },
        leaguePlayers: {
            type: graphQlLib.list(exports.leaguePlayerType),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt,
                sort: graphQlLib.GraphQLString
            },
            data: function (env) {
                return storeLib.getLeaguePlayersByLeagueId(env.source._id, env.args.offset, env.args.first, env.args.sort).hits;
            }
        },
        leaguePlayersConnection: {
            type: exports.leaguePlayerConnectionType,
            args: {
                after: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt,
                sort: graphQlLib.GraphQLString
            },
            data: function (env) {
                return storeLib.getLeaguePlayersByLeagueId(env.source._id, env.args.after ? (env.args.after + 1) : 0, env.args.first,
                    env.args.sort);
            }
        },
        leagueTeams: {
            type: graphQlLib.list(exports.leagueTeamType),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt,
                sort: graphQlLib.GraphQLString
            },
            data: function (env) {
                return storeLib.getLeagueTeamsByLeagueId(env.source._id, env.args.offset, env.args.first, env.args.sort).hits;
            }
        },
        leagueTeamsConnection: {
            type: exports.leagueTeamConnectionType,
            args: {
                after: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt,
                sort: graphQlLib.GraphQLString
            },
            data: function (env) {
                return storeLib.getLeagueTeamsByLeagueId(env.source._id, env.args.after ? (env.args.after + 1) : 0, env.args.first,
                    env.args.sort);
            }
        },
        nonMemberPlayers: {
            type: graphQlLib.list(exports.playerType),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt,
                sort: graphQlLib.GraphQLString
            },
            data: function (env) {
                return storeLib.getPlayersByNotLeagueId(env.source._id, env.args.offset, env.args.first, env.args.sort).hits;
            }
        },
        games: {
            type: graphQlLib.list(exports.gameType),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt,
                finished: graphQlLib.GraphQLBoolean
            },
            data: function (env) {
                return storeLib.getGamesByLeagueId(env.source._id, env.args.offset, env.args.first, env.args.finished).hits;
            }
        },
        activeGames: {
            type: graphQlLib.list(exports.gameType),
            args: {
                offset: graphQlLib.GraphQLInt,
                first: graphQlLib.GraphQLInt
            },
            data: function (env) {
                var leagueId = env.source._id;
                var offset = env.args.offset;
                var first = env.args.first;
                return storeLib.getActiveGamesByLeagueId(leagueId, offset, first).hits;
            }
        }
    }
});
