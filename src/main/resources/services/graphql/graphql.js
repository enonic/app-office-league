var graphQlLib = require('/lib/graphql');
var schemaLib = require('./graphql-schema');

exports.post = function (req) {
    log.info(JSON.stringify(req, null, 4));

    var body = JSON.parse(req.body);
    var result = graphQlLib.execute(schemaLib.schema, body.query, body.variables);

    

    return {
        contentType: 'application/json',
        body: result
    };
};