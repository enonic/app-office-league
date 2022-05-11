var graphQlLib = require('/lib/officeleague/graphql');
var graphQlRootQueryLib = require('./graphql-root-query');
var graphQlRootMutationLib = require('./graphql-root-mutation');

exports.schema = graphQlLib.createSchema({
    query: graphQlRootQueryLib.rootQueryType,
    mutation: graphQlRootMutationLib.rootMutationType
});
