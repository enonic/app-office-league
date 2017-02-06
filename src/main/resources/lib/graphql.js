var graphQlBean = __.newBean('com.enonic.app.officeleague.graphql.GraphQlBean');

exports.createType = function (schema) {
    return graphQlBean.createType(__.toScriptValue(schema));
};
exports.createSchema = function (schema) {
    return graphQlBean.createSchema(__.toScriptValue(schema));
};

exports.execute = function (schema, request) {
    return graphQlBean.execute(schema, request);
};
