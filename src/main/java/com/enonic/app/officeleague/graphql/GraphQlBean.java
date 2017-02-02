package com.enonic.app.officeleague.graphql;

import java.util.Map;

import graphql.GraphQL;
import graphql.Scalars;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLObjectType;
import graphql.schema.GraphQLSchema;

public class GraphQlBean
{

    public void test( final String request )
    {
        final GraphQLFieldDefinition.Builder helloFieldDefinitionBuilder =
            GraphQLFieldDefinition.newFieldDefinition().type( Scalars.GraphQLString ).name( "hello" ).staticValue( "Hello world3!" );

        GraphQLObjectType queryType = GraphQLObjectType.newObject().
            name( "helloWorldQuery" ).
            field( helloFieldDefinitionBuilder ).
            build();

        GraphQLSchema schema = GraphQLSchema.newSchema().
            query( queryType ).
            build();

        GraphQL graphQL = new GraphQL( schema );
        Map<String, Object> result = (Map<String, Object>) graphQL.execute( "{hello}" ).getData();

        System.out.println( result );
    }

    public static void main( String[] args )
    {
        final GraphQLFieldDefinition.Builder helloFieldDefinitionBuilder =
            GraphQLFieldDefinition.newFieldDefinition().type( Scalars.GraphQLString ).name( "hello" ).staticValue( "Hello world!" );

        GraphQLObjectType queryType = GraphQLObjectType.newObject().
            name( "helloWorldQuery" ).
            field( helloFieldDefinitionBuilder ).
            build();

        GraphQLSchema schema = GraphQLSchema.newSchema().
            query( queryType ).
            build();

        GraphQL graphQL = new GraphQL( schema );
        Map<String, Object> result = (Map<String, Object>) graphQL.execute( "{hello}" ).getData();

        System.out.println( result );
    }
}
