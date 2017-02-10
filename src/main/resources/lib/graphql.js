var graphQlBean = __.newBean('com.enonic.app.officeleague.graphql.GraphQlBean');

//Scalars
var Scalars = Java.type('graphql.Scalars')
exports.GraphQLInt = Scalars.GraphQLInt;
exports.GraphQLFloat = Scalars.GraphQLFloat;
exports.GraphQLString = Scalars.GraphQLString;
exports.GraphQLBoolean = Scalars.GraphQLBoolean;
exports.GraphQLID = Scalars.GraphQLID;


//Schema creation
exports.createSchema = function (schema) {
    return graphQlBean.createSchema(__.toScriptValue(schema));
};

exports.createObjectType = function (name, schema) {
    return graphQlBean.createObjectType(name, __.toScriptValue(schema));
};


//Schema util functions
exports.list = function (type) {
    return graphQlBean.list(type);
};

exports.reference = function (typeKey) {
    return graphQlBean.reference(typeKey);
};


//Query execution
exports.execute = function (schema, request) {
    return __.toNativeObject(graphQlBean.execute(schema, request));
};

