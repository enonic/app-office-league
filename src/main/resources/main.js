log.info('Application ' + app.name + ' started');


var graphQlBEan = __.newBean('com.enonic.app.officeleague.graphql.GraphQlBean');
var schema = graphQlBEan.createSchema({
    queries: {}
});
graphQlBEan.execute(schema, "query{hello}");