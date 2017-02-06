log.info('Application ' + app.name + ' started');

var graphQlLib = require('graphql');

var goalType = graphQlLib.createType({
    time: 'Int',
    playerId: 'ID'
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
                    time: "10",
                    playerId: "123"
                }
            }
        }
    }
});
graphQlLib.execute(schema, 'query{test2}'); 
