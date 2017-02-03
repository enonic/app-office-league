log.info('Application ' + app.name + ' started');


var graphQlBEan = __.newBean('com.enonic.app.officeleague.graphql.GraphQlBean');
var schema = graphQlBEan.createSchema({
    query: {
        hello: {
            type: 'String',
            staticValue: "test123"
        }
    }
});
graphQlBEan.execute(schema, 'query{hello}'); 