var graphQlBean = __.newBean('com.enonic.app.officeleague.graphql.GraphQlBean');

//Scalars
var Scalars = Java.type('graphql.Scalars')
exports.GraphQLInt = Scalars.GraphQLInt;
exports.GraphQLFloat = Scalars.GraphQLFloat;
exports.GraphQLString = Scalars.GraphQLString;
exports.GraphQLBoolean = Scalars.GraphQLBoolean;
exports.GraphQLID = Scalars.GraphQLID;


//Schema creation
exports.createSchema = function (params) {
    var query = required(params, 'query');
    var mutation = optional(params, 'mutation');
    return graphQlBean.createSchema(query, mutation);
};

exports.createObjectType = function (params) {
    var name = required(params, 'name');
    var fields = required(params, 'fields');
    var interfaces = optional(params, 'interfaces');
    var description = optional(params, 'description');
    return graphQlBean.createObjectType(name, __.toScriptValue(fields), __.toScriptValue(interfaces), description);
};

exports.createInterfaceType = function (params) {
    var name = required(params, 'name');
    var fields = required(params, 'fields');
    var description = optional(params, 'description');
    return graphQlBean.createInterfaceType(name, __.toScriptValue(fields), description);
};

exports.createEnumType = function (params) {
    var name = required(params, 'name');
    var values = required(params, 'values');
    var description = optional(params, 'description');
    return graphQlBean.createEnumType(name, __.toScriptValue(values), description);
};


//Schema util functions
exports.list = function (type) {
    return graphQlBean.list(type);
};

exports.nonNull = function (type) {
    return graphQlBean.nonNull(type);
};

exports.reference = function (typeKey) {
    return graphQlBean.reference(typeKey);
};


//Query execution
exports.execute = function (schema, request) {
    return __.toNativeObject(graphQlBean.execute(schema, request));
};

function required(params, name) {
    var value = params[name];
    if (value === undefined) {
        throw "Parameter '" + name + "' is required";
    }
    return value;
};

function optional(params, name) {
    var value = params[name];
    if (value === undefined) {
        return null;
    }
    return value;
};

