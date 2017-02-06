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


var schema = graphQlLib.createSchema({
    query: {
        hello: {
            type: 'String',
            data: "test124"
        },
        point: {
            type: pointType,
            data: aPoint
        }
    }
});

var result = graphQlLib.execute(schema, 'query{hello}');
log.info('result: ' + JSON.stringify(result));
var result2 = graphQlLib.execute(schema, 'query{point{playerId time against}}');
log.info('result2: ' + JSON.stringify(result2));

