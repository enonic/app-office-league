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
            type: graphQlLib.scalar('String'), //TODO Change to enum
            data: function (env) {
                return env.source.nationality;
            }
        },
        handedness: {
            type: graphQlLib.scalar('String'), //TODO Change to enum
            data: function (env) {
                return env.source.handedness;
            }
        },
        description: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.source.description;
            }
        },
        teams: {
            type: graphQlLib.list(graphQlLib.reference('Team')),
            args: {
                start: graphQlLib.scalar('Int'),
                count: graphQlLib.scalar('Int')
            },
            data: function (env) {
                return storeLib.getTeamsByPlayerId(env.source._id, env.args.start, env.args.count).teams;
            }
        },
        leaguePlayers: {
            type: graphQlLib.list(graphQlLib.reference('LeaguePlayer')),
            args: {
                start: graphQlLib.scalar('Int'),
                count: graphQlLib.scalar('Int')
            },
            data: function (env) {
                return storeLib.getLeaguePlayersByPlayerId(env.source._id, env.args.start, env.args.count).players;
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
        },
        leagueTeams: {
            type: graphQlLib.list(graphQlLib.reference('LeagueTeam')),
            args: {
                start: graphQlLib.scalar('Int'),
                count: graphQlLib.scalar('Int')
            },
            data: function (env) {
                return storeLib.getLeagueTeamsByTeamId(env.source._id, env.args.start, env.args.count).teams;
            }
        }
    }
);

var gamePlayerType = graphQlLib.createType('GamePlayer', {
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
        score: {
            type: graphQlLib.scalar('Int'),
            data: function (env) {
                return env.source.score;
            }
        },
        side: {
            type: graphQlLib.scalar('String'), //TODO Replace by Enum
            data: function (env) {
                return env.source.side;
            }
        },
        winner: {
            type: graphQlLib.scalar('Boolean'),
            data: function (env) {
                return env.source.winner;
            }
        },
        ratingDelta: {
            type: graphQlLib.scalar('Int'),
            data: function (env) {
                return env.source.ratingDelta;
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

var gameTeamType = graphQlLib.createType('GameTeam', {
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
        score: {
            type: graphQlLib.scalar('Int'),
            data: function (env) {
                return env.source.score;
            }
        },
        side: {
            type: graphQlLib.scalar('String'), //TODO Replace by Enum
            data: function (env) {
                return env.source.side;
            }
        },
        winner: {
            type: graphQlLib.scalar('Boolean'),
            data: function (env) {
                return env.source.winner;
            }
        },
        ratingDelta: {
            type: graphQlLib.scalar('Int'),
            data: function (env) {
                return env.source.ratingDelta;
            }
        },
        team: {
            type: teamType,
            data: function (env) {
                return storeLib.getTeamById(env.source.teamId);
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
            return storeLib.getCommentsByGameId(env.source._id, env.args.start, env.args.count).comments;
        }
    },
    gamePlayers: {
        type: graphQlLib.list(gamePlayerType),
        data: function (env) {
            return env.source.gamePlayers;
        }
    },
    gameTeams: {
        type: graphQlLib.list(gameTeamType),
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
});

var leaguePlayerType = graphQlLib.createType('LeaguePlayer', {
    id: {
        type: graphQlLib.scalar('ID'),
        data: function (env) {
            return env.source._id;
        }
    },
    rating: {
        type: graphQlLib.scalar('Int'),
        data: function (env) {
            return env.source.rating;
        }
    },
    player: {
        type: playerType,
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
});

var leagueTeamType = graphQlLib.createType('LeagueTeam', {
    id: {
        type: graphQlLib.scalar('ID'),
        data: function (env) {
            return env.source._id;
        }
    },
    rating: {
        type: graphQlLib.scalar('Int'),
        data: function (env) {
            return env.source.rating;
        }
    },
    team: {
        type: teamType,
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
});

var leagueType = graphQlLib.createType('League', {
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
    sport: {
        type: graphQlLib.scalar('String'), //TODO Change to enum
        data: function (env) {
            return env.source.sport;
        }
    },
    description: {
        type: graphQlLib.scalar('String'),
        data: function (env) {
            return env.source.description;
        }
    },
    config: {
        type: graphQlLib.scalar('String'), //TODO Is it? Is there a unstructured type?
        data: function (env) {
            return JSON.stringify(env.source.config);
        }
    },
    leaguePlayers: {
        type: graphQlLib.list(leaguePlayerType),
        args: {
            start: graphQlLib.scalar('Int'),
            count: graphQlLib.scalar('Int')
        },
        data: function (env) {
            return storeLib.getLeaguePlayersByLeagueId(env.source._id, env.args.start, env.args.count).players;
        }
    },
    leagueTeams: {
        type: graphQlLib.list(leagueTeamType),
        args: {
            start: graphQlLib.scalar('Int'),
            count: graphQlLib.scalar('Int')
        },
        data: function (env) {
            return storeLib.getLeagueTeamsByLeagueId(env.source._id, env.args.start, env.args.count).teams;
        }
    },
    games: {
        type: graphQlLib.list(gameType),
        args: {
            start: graphQlLib.scalar('Int'),
            count: graphQlLib.scalar('Int')
        },
        data: function (env) {
            return storeLib.getGamesByLeagueId(env.source._id, env.args.start, env.args.count).games;
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
        team: {
            type: teamType,
            args: {
                id: graphQlLib.scalar('ID'),
                name: graphQlLib.scalar('ID')
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
                return storeLib.getGamesByLeagueId(leagueId, start, count).games;
            }
        },
        league: {
            type: leagueType,
            args: {
                id: graphQlLib.scalar('ID')
            },
            data: function (env) {
                var id = env.args.id;
                return storeLib.getLeagueById(id);
            }
        },
        leagues: {
            type: graphQlLib.list(leagueType),
            args: {
                start: graphQlLib.scalar('Int'),
                count: graphQlLib.scalar('Int')
            },
            data: function (env) {
                var start = env.args.start;
                var count = env.args.count;
                return storeLib.getLeagues(start, count).leagues;
            }
        }
    },
    mutation: {
        createLeague: {
            type: leagueType,
            args: {
                name: graphQlLib.scalar('String'),
                sport: graphQlLib.scalar('String'),//TODO
                description: graphQlLib.scalar('String'),
                config: graphQlLib.scalar('String')//TODO
            },
            data: function (env) {
                return storeLib.createLeague({
                    name: env.args.name,
                    sport: env.args.sport,
                    description: env.args.description,
                    config: env.args.config ? JSON.parse(env.args.config) : {} //TODO
                });
            }
        },
        createPlayer: {
            type: playerType,
            args: {
                name: graphQlLib.scalar('String'),
                nickname: graphQlLib.scalar('String'),
                nationality: graphQlLib.scalar('String'), //TODO
                handedness: graphQlLib.scalar('String'), //TODO
                description: graphQlLib.scalar('String')
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
            type: playerType,
            args: {
                id: graphQlLib.scalar('ID'),
                name: graphQlLib.scalar('String'),
                nickname: graphQlLib.scalar('String'),
                nationality: graphQlLib.scalar('String'), //TODO
                handedness: graphQlLib.scalar('String'), //TODO
                description: graphQlLib.scalar('String')
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

    log.info('post');
    var body = JSON.parse(req.body);
    var result = graphQlLib.execute(schema, body.query);
    return {
        contentType: 'application/json',
        body: result
    };
}