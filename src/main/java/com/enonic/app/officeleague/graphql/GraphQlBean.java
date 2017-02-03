package com.enonic.app.officeleague.graphql;

import java.util.Map;

import com.google.common.collect.ImmutableMap;

import graphql.GraphQL;
import graphql.Scalars;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLObjectType;
import graphql.schema.GraphQLScalarType;
import graphql.schema.GraphQLSchema;
import graphql.schema.GraphQLType;

import com.enonic.xp.script.ScriptValue;

public class GraphQlBean
{
    ImmutableMap<String, GraphQLType> GRAPH_QL_SCALAR_TYPE_MAP = ImmutableMap.<String, GraphQLType>builder().
        put( "Int", Scalars.GraphQLInt ).
        put( "Float", Scalars.GraphQLFloat ).
        put( "String", Scalars.GraphQLString ).
        put( "Boolean", Scalars.GraphQLBoolean ).
        put( "ID", Scalars.GraphQLID ).
        build();

    public GraphQLSchema createSchema( final ScriptValue params )
    {
        
        GraphQLObjectType.Builder graphQlQuery = GraphQLObjectType.newObject().
            name( "QueryType" );

        final ScriptValue query = params.getMember( "query" );
        createQueryFieldTypes( query, graphQlQuery );

        GraphQLSchema schema = GraphQLSchema.newSchema().
            query( graphQlQuery ).
            build();
        return schema;
    }

    private void createQueryFieldTypes( final ScriptValue query, final GraphQLObjectType.Builder graphQlQuery )
    {
        for ( String queryFieldKey : query.getKeys() )
        {
            final ScriptValue queryFieldValue = query.getMember( queryFieldKey );

            final String typeKey = queryFieldValue.getMember( "type" ).getValue( String.class );
            final GraphQLType graphQLType = getType( typeKey );

            final GraphQLFieldDefinition.Builder graphQlField = GraphQLFieldDefinition.newFieldDefinition().
                type( (GraphQLScalarType) graphQLType ). //TODO
                name( queryFieldKey );

            final Object staticValue = queryFieldValue.getMember( "staticValue" ).getValue( String.class );
            if ( staticValue != null )
            {
                graphQlField.staticValue( staticValue );
            }

            graphQlQuery.field( graphQlField );
        }
    }

    private GraphQLType getType( final String typeKey )
    {
        return GRAPH_QL_SCALAR_TYPE_MAP.get( typeKey );
    }

    public void execute( final GraphQLSchema schema, final String request )
    {
        GraphQL graphQL = new GraphQL( schema );
        Map<String, Object> result = (Map<String, Object>) graphQL.execute( request ).getData();

        System.out.println( result );
    }
}
