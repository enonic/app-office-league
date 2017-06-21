var graphQlLib = require('/lib/graphql');
var graphQlConnectionLib = require('/lib/graphql-connection');
var graphQlEnumsLib = require('./graphql-enums');
var graphQlUtilLib = require('./graphql-util');
var portalLib = require('/lib/xp/portal');

exports.infoPageType = graphQlLib.createObjectType({
    name: 'InfoPage',
    fields: {
        title: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            resolve: function (env) {
                return env.source.displayName;
            }
        },
        name: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            resolve: function (env) {
                return env.source._name;
            }
        },
        body: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            resolve: function (env) {
                return env.source.data.body && portalLib.processHtml({value: env.source.data.body, type: 'absolute'});
            }
        }
    }
});