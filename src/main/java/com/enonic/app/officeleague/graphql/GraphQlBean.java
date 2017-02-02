package com.enonic.app.officeleague.graphql;

import java.util.Map;

import graphql.GraphQL;
import graphql.Scalars;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLObjectType;
import graphql.schema.GraphQLSchema;

public class GraphQlBean
{

    public GraphQLSchema createSchema( final Object obj )
    {
        final GraphQLFieldDefinition.Builder helloFieldDefinitionBuilder =
            GraphQLFieldDefinition.newFieldDefinition().type( Scalars.GraphQLString ).name( "hello" ).staticValue( "Hello world4!" );

        GraphQLObjectType queryType = GraphQLObjectType.newObject().
            name( "QueryType" ).
            field( helloFieldDefinitionBuilder ).
            build();

        GraphQLSchema schema = GraphQLSchema.newSchema().
            query( queryType ).
            build();
        return schema;
    }

    public void execute( final GraphQLSchema schema, final String request )
    {
        GraphQL graphQL = new GraphQL( schema );
        Map<String, Object> result = (Map<String, Object>) graphQL.execute( request ).getData();

        System.out.println( result );
    }
}
