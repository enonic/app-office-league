log.info('Application ' + app.name + ' started');

var graphQlLib = require('graphql');

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
        }
    }
});
graphQlLib.execute(schema, 'query{test2}'); 
