var graphQlLib = require('graphql');
var graphQlUtilLib = require('./graphql-util');

var pageInfoType = graphQlLib.createObjectType({
    name: 'PageInfo',
    fields: {
        startCursor: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLInt), //TODO Replace by base64
            data: function (env) {
                return graphQlUtilLib.toInt(env.source.startCursor);
            }
        },
        endCursor: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLInt), //TODO Replace by base64
            data: function (env) {
                return graphQlUtilLib.toInt(env.source.endCursor);
            }
        },
        hasNext: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLBoolean),
            data: function (env) {
                return env.source.hasNext;
            }
        }
    }
});


function createEdgeType(name, type) {
    return graphQlLib.createObjectType({
        name: name + 'Edge',
        fields: {
            node: {
                type: graphQlLib.nonNull(type),
                data: function (env) {
                    return env.source.node;
                }
            },
            cursor: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLInt), //TODO Replace by base64
                data: function (env) {
                    return graphQlUtilLib.toInt(env.source.cursor);
                }
            }
        }
    });
}

exports.createConnectionType = function (name, type) {
    return graphQlLib.createObjectType({
        name: name + 'Connection',
        fields: {
            totalCount: {
                type: graphQlLib.nonNull(graphQlLib.GraphQLInt),
                data: function (env) {
                    return env.source.total;
                }
            },
            edges: {
                type: graphQlLib.list(createEdgeType(name, type)),
                data: function (env) {
                    var hits = env.source.hits;
                    var edges = [];
                    for (var i = 0; i < hits.length; i++) {
                        edges.push({
                            node: hits[i],
                            cursor: env.source.start + i
                        });
                    }
                    return edges;
                }
            },
            pageInfo: {
                type: pageInfoType,
                data: function (env) {
                    log.info('pageInfo:' + JSON.stringify(env, null, 2));
                    return {
                        startCursor: env.source.start,
                        endCursor: env.source.start + (env.source.count == 0 ? 0 : (env.source.count - 1)),
                        hasNext: (env.source.start + env.source.count) < env.source.total
                    }
                }
            }
        }
    });
}
