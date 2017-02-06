log.info('Application ' + app.name + ' started');

var graphQlLib = require('graphql');

var goalType = graphQlLib.createType('Goal', {
    time: {
        type: 'String',
        data: 'aa'
    },
    time2: {
        type: 'Int',
        data: function (env) {
            log.info("env: " + env.getSource().time);
            return '15'
        }
    }
});


var schema = graphQlLib.createSchema({
    query: {
        hello: {
            type: 'String',
            data: "test124"
        },
        test2: {
            type: 'String',
            data: function () {
                return "qqs"
            }
        },
        test3: {
            type: goalType,
            data: function () {
                return {
                    time: 10,
                    time2: 11
                }
            }
        }
    }
});

var result = graphQlLib.execute(schema, 'query{test2}');
log.info('result: ' + JSON.stringify(result));
var result2 = graphQlLib.execute(schema, 'query{test3{time, time2}}');
log.info('result2: ' + JSON.stringify(result2));
log.info('result2.time2: ' + JSON.stringify(result2.test3.time2));

