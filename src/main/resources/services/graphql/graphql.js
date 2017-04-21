var contextLib = require('/lib/xp/context');
var graphQlLib = require('graphql');
var schemaLib = require('./graphql-schema');

exports.post = function (req) {
    var body = JSON.parse(req.body);

    var result = contextLib.run({
        principals: ["role:system.admin", "role:system.authenticated"]
    }, function () {
        return graphQlLib.execute(schemaLib.schema, body.query, body.variables);
    });
    return {
        contentType: 'application/json',
        body: result
    };
};