var graphQlBean = __.newBean('com.enonic.app.officeleague.graphql.GraphQlBean');


//Schema creation
exports.createSchema = function (schema) {
    return graphQlBean.createSchema(__.toScriptValue(schema));
};

exports.createOutputObjectType = function (name, schema) {
    return graphQlBean.createOutputObjectType(name, __.toScriptValue(schema));
};


//Schema util functions
exports.list = function (type) {
    return graphQlBean.list(type);
};

exports.scalarType = function (typeKey) {
    return graphQlBean.scalar(typeKey);
};

exports.reference = function (typeKey) {
    return graphQlBean.reference(typeKey);
};

//Query execution
exports.execute = function (schema, request) {
    return __.toNativeObject(graphQlBean.execute(schema, request));
};


//Scalars
exports.GraphQLInt = exports.scalarType('Int');
exports.GraphQLFloat = exports.scalarType('Float');
exports.GraphQLString = exports.scalarType('String');
exports.GraphQLBoolean = exports.scalarType('Boolean');
exports.GraphQLID = exports.scalarType('ID');