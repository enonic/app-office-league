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

    private void createQueryFieldTypes( final ScriptValue scriptQuery, final GraphQLObjectType.Builder graphQlQuery )
    {
        for ( String scriptQueryFieldKey : scriptQuery.getKeys() )
        {
            final ScriptValue scriptQueryFieldValue = scriptQuery.getMember( scriptQueryFieldKey );

            final String typeKey = scriptQueryFieldValue.getMember( "type" ).getValue( String.class );
            final GraphQLType graphQLType = getType( typeKey );

            final GraphQLFieldDefinition.Builder graphQlField = GraphQLFieldDefinition.newFieldDefinition().
                type( (GraphQLScalarType) graphQLType ). //TODO
                name( scriptQueryFieldKey );

            final ScriptValue data = scriptQueryFieldValue.getMember( "data" );
            if ( data != null )
            {
                if ( data.isValue() )
                {
                    graphQlField.staticValue( data.getValue() );
                }
                else if ( data.isFunction() )
                {
                    graphQlField.dataFetcher( ( env ) -> data.call().getValue() );
                }

                graphQlQuery.field( graphQlField );
            }
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
