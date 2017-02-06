var graphQlLib = require('graphql');

var pointType = graphQlLib.createType('Point', {
        playerId: {
            type: graphQlLib.scalar('ID'),
            data: function (env) {
                return env.getSource().playerId;
            }
        },
        time: {
            type: graphQlLib.scalar('Int'),
            data: function (env) {
                return env.getSource().time;
            }
        },
        against: {
            type: graphQlLib.scalar('Boolean'),
            data: function (env) {
                return env.getSource().against;
            }
        }
    }
);


var points = [{
    playerId: '0000-0000-0001',
    time: 12345,
    against: true
}, {
    playerId: '0000-0000-0002',
    time: 56789,
    against: false
}];
var pointsMap = {
    first: points[0],
    second: points[1]
};


var schema = graphQlLib.createSchema({
    query: {
        hello: {
            type: graphQlLib.scalar('String'),
            data: "test124"
        },
        point: {
            type: pointType,
            data: pointsMap.first
        },
        pointByPlayerId: {
            type: pointType,
            args: {
                playerId: graphQlLib.scalar('ID')
            },
            data: function (env) {
                return points.filter(function (point) {
                    return point.playerId == env.getArgument('playerId');
                })[0];
            }
        },
        points: {
            type: graphQlLib.list(pointType),
            data: points
        }
    }
});

var result = graphQlLib.execute(schema, 'query{hello}');
log.info('result: ' + JSON.stringify(result));
var getPointResult = graphQlLib.execute(schema, 'query{point{playerId time against}}');
log.info('getPointResult: ' + JSON.stringify(getPointResult));
var getPointsResult = graphQlLib.execute(schema, 'query{points{playerId time against}}');
log.info('getPointsResult: ' + JSON.stringify(getPointsResult));
var getPointByIdResult = graphQlLib.execute(schema, 'query{pointByPlayerId(playerId: "0000-0000-0002"){playerId time against}}');
log.info('getPointByIdResult: ' + JSON.stringify(getPointByIdResult));


exports.post = function (req) {
    var body = JSON.parse(req.body);
    log.info('req.body: ' + body);
    log.info('req.body.query: ' + body.query);
    var result = graphQlLib.execute(schema, body.query);
    log.info('result: ' + JSON.stringify(result));
    return {
        contentType: 'application/json',
        body: result
    };
}