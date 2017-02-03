package com.enonic.app.officeleague.graphql;

import java.util.Map;

import graphql.GraphQL;
import graphql.Scalars;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLObjectType;
import graphql.schema.GraphQLSchema;
import jdk.nashorn.api.scripting.ScriptObjectMirror;

public class GraphQlBean
{

    public GraphQLSchema createSchema( final ScriptObjectMirror params )
    {
        GraphQLObjectType.Builder graphQlQuery = GraphQLObjectType.newObject().
            name( "QueryType" );

        final ScriptObjectMirror query = (ScriptObjectMirror) params.get( "query" );

        for ( Map.Entry<String, Object> queryField : query.entrySet() )
        {
            final String queryFieldKey = queryField.getKey();
            final GraphQLFieldDefinition.Builder graphQlField = GraphQLFieldDefinition.newFieldDefinition().
                type( Scalars.GraphQLString ).
                name( queryFieldKey );

            final ScriptObjectMirror queryFieldValue = (ScriptObjectMirror) queryField.getValue();

            final Object staticValue = queryFieldValue.get( "staticValue" );
            if ( staticValue != null )
            {
                graphQlField.staticValue( staticValue );
            }

            graphQlQuery.field( graphQlField );
        }

        GraphQLSchema schema = GraphQLSchema.newSchema().
            query( graphQlQuery ).
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
