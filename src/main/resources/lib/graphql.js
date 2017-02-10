var graphQlBean = __.newBean('com.enonic.app.officeleague.graphql.GraphQlBean');

exports.createSchema = function (schema) {
    return graphQlBean.createSchema(__.toScriptValue(schema));
};

exports.createType = function (name, schema) {
    return graphQlBean.createType(name, __.toScriptValue(schema));
};

exports.list = function (type) {
    return graphQlBean.list(type);
};

exports.scalarType = function (typeKey) {
    return graphQlBean.scalar(typeKey);
};

exports.reference = function (typeKey) {
    return graphQlBean.reference(typeKey);
};

exports.execute = function (schema, request) {
    return __.toNativeObject(graphQlBean.execute(schema, request));
};


//Scalars
exports.GraphQLInt = exports.scalarType('Int');
exports.GraphQLFloat = exports.scalarType('Float');
exports.GraphQLString = exports.scalarType('String');
exports.GraphQLBoolean = exports.scalarType('Boolean');
exports.GraphQLID = exports.scalarType('ID');


//TODO Export scalar types