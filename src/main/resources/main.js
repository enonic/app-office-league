log.info('Application ' + app.name + ' started');

var graphQlLib = require('graphql');

var pointType = graphQlLib.createType('Point', {
        playerId: {
            type: 'String',
            data: function (env) {
                return env.getSource().playerId;
            }
        },
        time: {
            type: 'Int',
            data: function (env) {
                return env.getSource().time;
            }
        },
        against: {
            type: 'Boolean',
            data: function (env) {
                return env.getSource().against;
            }
        }
    }
);

var aPoint = {
    playerId: '0000-0000-0001',
    time: 12345,
    against: true
};

var points = [
    aPoint, aPoint
];


var schema = graphQlLib.createSchema({
    query: {
        hello: {
            type: 'String',
            data: "test124"
        },
        point: {
            type: pointType,
            data: aPoint
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


