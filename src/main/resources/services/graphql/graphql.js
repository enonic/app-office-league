var graphQlLib = require('graphql');
var storeLib = require('office-league-store');

var playerType = graphQlLib.createType('Player', {
        id: {
            type: graphQlLib.scalar('ID'),
            data: function (env) {
                return env.getSource()._id;
            }
        },
        name: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.getSource().name;
            }
        },
        nickname: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.getSource().nickname;
            }
        },
        nationality: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.getSource().nationality;
            }
        },
        handedness: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.getSource().handedness;
            }
        },
        description: {
            type: graphQlLib.scalar('String'),
            data: function (env) {
                return env.getSource().description;
            }
        }
    }
);

var schema = graphQlLib.createSchema({
    query: {
        player: {
            type: playerType,
            args: {
                id: graphQlLib.scalar('ID'),
                name: graphQlLib.scalar('ID')
            },
            data: function (env) {
                var id = env.getArgument('id');
                var name = env.getArgument('name');
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
            data: function () {
                return storeLib.getPlayers().players;
            }
        }
    }
});


exports.post = function (req) {
    var body = JSON.parse(req.body);
    log.info("Query: " + body.query);
    var result = graphQlLib.execute(schema, body.query);
    log.info("Query result: " + JSON.stringify(result));
    return {
        contentType: 'application/json',
        body: {data: result}
    };
}