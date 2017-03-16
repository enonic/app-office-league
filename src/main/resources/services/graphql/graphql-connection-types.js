var graphQlObjectTypesLib = require('./graphql-object-types');
var graphQlConnectionLib = require('./graphql-connection');

exports.playerConnectionType = graphQlConnectionLib.createConnectionType ('Player', graphQlObjectTypesLib.playerType);
exports.teamConnectionType = graphQlConnectionLib.createConnectionType ('Team', graphQlObjectTypesLib.teamType);