var graphQlLib = require('graphql');
var storeLib = require('office-league-store');

var playerType = graphQlLib.createType('Player', {
        id: {
            type: graphQlLib.scalar('ID'),
            data: function (env) {
                return env.source._id;
            }
        },
        name: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.source.name;
            }
        },
        nickname: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.source.nickname;
            }
        },
        nationality: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.source.nationality;
            }
        },
        handedness: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.source.handedness;
            }
        },
        description: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.source.description;
            }
        }
    }
);

var teamType = graphQlLib.createType('Team', {
        id: {
            type: graphQlLib.scalar('ID'),
            data: function (env) {
                return env.source._id;
            }
        },
        name: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.source.name;
            }
        },
        description: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.source.nickname;
            }
        },
        players: {
            type: graphQlLib.list(playerType),
            data: function (env) {
                return toArray(env.source.playerIds).map(function (playerId) {
                    return storeLib.getPlayerById(playerId);
                });
            }
        }
    }
);

var pointType = graphQlLib.createType('Point', {
        id: {
            type: graphQlLib.scalar('ID'),
            data: function (env) {
                return env.source._id;
            }
        },
        time: {
            type: graphQlLib.scalar('Int'),
            data: function (env) {
                return env.source.time;
            }
        },
        against: {
            type: graphQlLib.scalar('Boolean'),
            data: function (env) {
                return env.source.against;
            }
        },
        player: {
            type: playerType,
            data: function (env) {
                return storeLib.getPlayerById(env.source.playerId);
            }
        }
    }
);

var commentType = graphQlLib.createType('Comment', {
        id: {
            type: graphQlLib.scalar('ID'),
            data: function (env) {
                return env.source._id;
            }
        },
        text: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.source.text;
            }
        },
        author: {
            type: playerType,
            data: function (env) {
                return storeLib.getPlayerById(env.source.author);
            }
        },
        likes: {
            type: graphQlLib.list(playerType),
            data: function (env) {
                return toArray(env.source.likes).map(function (playerId) {
                    storeLib.getPlayerById(playerId)
                });
            }
        }
    }
);

var gameType = graphQlLib.createType('Game', {
        id: {
            type: graphQlLib.scalar('ID'),
            data: function (env) {
                return env.source._id;
            }
        },
        time: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.source.time;
            }
        },
        finished: {
            type: graphQlLib.scalar('Boolean'),
            data: function (env) {
                return env.source.finished;
            }
        },
        points: {
            type: graphQlLib.list(pointType),
            data: function (env) {
                return env.source.points;
            }
        },
        comments: {
            type: graphQlLib.list(commentType),
            args: {
                start: graphQlLib.scalar('Int'),
                count: graphQlLib.scalar('Int')
            },
            data: function (env) {
                return storeLib.getGameComments(env.source._id, env.args.start, env.args.count).comments;
            }
        }
    }
);

graphQlLib.updateType(playerType, {
    teams: {
        type: graphQlLib.list(teamType),
        data: function (env) {
            return [storeLib.getTeamByName('A bald old guy & a young chick')];
        }
    }
});

var schema = graphQlLib.createSchema({
    query: {
        player: {
            type: playerType,
            args: {
                id: graphQlLib.scalar('ID'),
                name: graphQlLib.scalar('ID')
            },
            data: function (env) {
                var id = env.args.id;
                var name = env.args.name;
                if (id) {
                    return storeLib.getPlayerById(id);
                } else if (name) {
                    return storeLib.getPlayerByName(name);
                }
                return null;
            }
        },
        players: {
            type: graphQlLib.list(playerType),
            args: {
                start: graphQlLib.scalar('Int'),
                count: graphQlLib.scalar('Int')
            },
            data: function (env) {
                var start = env.args.start;
                var count = env.args.count;
                return storeLib.getPlayers(start, count).players;
            }
        },
        teams: {
            type: graphQlLib.list(teamType),
            args: {
                start: graphQlLib.scalar('Int'),
                count: graphQlLib.scalar('Int')
            },
            data: function (env) {
                var start = env.args.start;
                var count = env.args.count;
                return storeLib.getTeams(start, count).teams;
            }
        },
        games: {
            type: graphQlLib.list(gameType),
            args: {
                leagueId: graphQlLib.scalar('ID'),
                start: graphQlLib.scalar('Int'),
                count: graphQlLib.scalar('Int')
            },
            data: function (env) {
                var leagueId = env.args.leagueId;
                var start = env.args.start;
                var count = env.args.count;
                return storeLib.getLeagueGames(leagueId, start, count).games;
            }
        }
    }
});

function toArray(object, callback) {
    if (!object) {
        return [];
    }
    if (object.constructor === Array) {
        return object;
    }
    return [object];
}

exports.post = function (req) {
    var body = JSON.parse(req.body);
    var result = graphQlLib.execute(schema, body.query);
    return {
        contentType: 'application/json',
        body: result
    };
}