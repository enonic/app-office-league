const graphQlLib = require('/lib/graphql');

for (let prop in graphQlLib) {
    exports[prop] = graphQlLib[prop];
}

const schemaGenerator = graphQlLib.newSchemaGenerator();

exports.createSchema = function (params) {
    return schemaGenerator.createSchema(params);
}

exports.createPageInfoObjectType = function (params) {
    return schemaGenerator.createPageInfoObjectType(params);
}

exports.createObjectType = function (params) {
    return schemaGenerator.createObjectType(params);
}

exports.createInputObjectType = function (params) {
    return schemaGenerator.createInputObjectType(params);
}

exports.createInterfaceType = function (params) {
    return schemaGenerator.createInterfaceType(params);
}

exports.createUnionType = function (params) {
    return schemaGenerator.createUnionType(params);
}

exports.createEnumType = function (params) {
    return schemaGenerator.createEnumType(params);
}

exports.getSchemaGenerator = function () {
    return schemaGenerator;
}
