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
    ImmutableMap<String, GraphQLScalarType> GRAPH_QL_SCALAR_TYPE_MAP = ImmutableMap.<String, GraphQLScalarType>builder().
        put( "Int", Scalars.GraphQLInt ).
        put( "Float", Scalars.GraphQLFloat ).
        put( "String", Scalars.GraphQLString ).
        put( "Boolean", Scalars.GraphQLBoolean ).
        put( "ID", Scalars.GraphQLID ).
        build();


    public GraphQLObjectType.Builder createType( final ScriptValue params )
    {
        final GraphQLObjectType.Builder graphQlType = GraphQLObjectType.newObject().
            name( "DoesNotMatter" );
        setTypeFieldTypes( params, graphQlType );
        return graphQlType;
    }

    private void setTypeFieldTypes( final ScriptValue scriptType, final GraphQLObjectType.Builder graphQlType )
    {
        for ( String scriptFieldKey : scriptType.getKeys() )
        {
            final ScriptValue scriptFieldValue = scriptType.getMember( scriptFieldKey );
            final GraphQLType graphQLType = getScalarType( scriptFieldValue.getValue( String.class ) );//TODO

            final GraphQLFieldDefinition graphQlField =
                GraphQLFieldDefinition.newFieldDefinition().name( scriptFieldKey ).type( graphQlType ).build();
            graphQlType.field( graphQlField );
        }
    }

    public GraphQLSchema createSchema( final ScriptValue params )
    {
        GraphQLObjectType.Builder graphQlQuery = GraphQLObjectType.newObject().
            name( "QueryType" );

        final ScriptValue scriptQuery = params.getMember( "query" );
        setQueryFieldTypes( scriptQuery, graphQlQuery );

        return GraphQLSchema.newSchema().
            query( graphQlQuery ).
            build();
    }

    private void setQueryFieldTypes( final ScriptValue scriptQuery, final GraphQLObjectType.Builder graphQlQuery )
    {
        for ( String scriptFieldKey : scriptQuery.getKeys() )
        {
            final ScriptValue scriptFieldValue = scriptQuery.getMember( scriptFieldKey );

            final GraphQLFieldDefinition.Builder graphQlField = GraphQLFieldDefinition.newFieldDefinition().
                name( scriptFieldKey );

            final Object scriptFieldType = scriptFieldValue.getMember( "type" ).getValue();
            if ( scriptFieldType instanceof GraphQLObjectType.Builder )
            {
                graphQlField.type( (GraphQLObjectType.Builder) scriptFieldType );
            }
            else
            {
                final GraphQLScalarType graphQLType = getScalarType( scriptFieldType.toString() );
                graphQlField.type( graphQLType );
            }
            final ScriptValue data = scriptFieldValue.getMember( "data" );
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

    private GraphQLScalarType getScalarType( final String typeKey )
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
