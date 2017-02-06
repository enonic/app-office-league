var graphQlBean = __.newBean('com.enonic.app.officeleague.graphql.GraphQlBean');

exports.createType = function (name, schema) {
    return graphQlBean.createType(name, __.toScriptValue(schema));
};
exports.createSchema = function (schema) {
    return graphQlBean.createSchema(__.toScriptValue(schema));
};

exports.execute = function (schema, request) {
    return __.toNativeObject(graphQlBean.execute(schema, request));
};
