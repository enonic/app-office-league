var graphQlBean = __.newBean('com.enonic.app.officeleague.graphql.GraphQlBean');

exports.createSchema = function (schema) {
    return graphQlBean.createSchema(__.toScriptValue(schema));
};

exports.execute = function (schema, request) {
    return graphQlBean.execute(schema, request);
};
