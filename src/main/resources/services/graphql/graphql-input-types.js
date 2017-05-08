var graphQlLib = require('/lib/graphql');
var graphQlEnumsLib = require('./graphql-enums');

exports.pointCreationType = graphQlLib.createInputObjectType({
    name: 'PointCreation',
    description: 'Representation of a goal/point for game creation.',
    fields: {
        time: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLInt)
        },
        against: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLBoolean)
        },
        playerId: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID)
        }
    }
});

exports.gamePlayerCreationType = graphQlLib.createInputObjectType({
    name: 'GamePlayerCreation',
    fields: {
        side: {
            type: graphQlLib.nonNull(graphQlEnumsLib.sideEnumType)
        },
        playerId: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID)
        }
    }
});