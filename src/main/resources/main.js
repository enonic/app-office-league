log.info('Application ' + app.name + ' started');

var graphQlLib = require('graphql');

var schema = graphQlLib.createSchema({
    query: {
        hello: {
            type: 'String',
            staticValue: "test124"
        }
    }
});
graphQlLib.execute(schema, 'query{hello}'); 