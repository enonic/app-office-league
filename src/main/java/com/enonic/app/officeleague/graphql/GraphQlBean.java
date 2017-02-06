package com.enonic.app.officeleague.graphql;

import java.util.Map;
import java.util.stream.Collectors;

import com.google.common.collect.ImmutableMap;

import graphql.ExecutionResult;
import graphql.GraphQL;
import graphql.Scalars;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLInputType;
import graphql.schema.GraphQLInterfaceType;
import graphql.schema.GraphQLList;
import graphql.schema.GraphQLObjectType;
import graphql.schema.GraphQLOutputType;
import graphql.schema.GraphQLScalarType;
import graphql.schema.GraphQLSchema;
import graphql.schema.GraphQLUnionType;

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


    public GraphQLSchema createSchema( final ScriptValue schemaScriptValue )
    {
        final ScriptValue queryScriptValue = schemaScriptValue.getMember( "query" );
        final GraphQLObjectType.Builder queryObjectType = createType( "QueryType", queryScriptValue );

        return GraphQLSchema.newSchema().
            query( queryObjectType ).
            build();
    }

    public GraphQLObjectType.Builder createType( final String name, final ScriptValue scriptValue )
    {
        final GraphQLObjectType.Builder type = GraphQLObjectType.newObject().name( name );

        for ( String scriptFieldKey : scriptValue.getKeys() )
        {
            final ScriptValue scriptFieldValue = scriptValue.getMember( scriptFieldKey );

            final GraphQLFieldDefinition.Builder graphQlField = GraphQLFieldDefinition.newFieldDefinition().
                name( scriptFieldKey );

            setFieldArguments( scriptFieldValue, graphQlField );
            setFieldType( scriptFieldValue, graphQlField );
            setFieldData( scriptFieldValue, graphQlField );
            type.field( graphQlField );
        }
        return type;
    }

    private void setFieldArguments( final ScriptValue scriptFieldValue, final GraphQLFieldDefinition.Builder graphQlField )
    {
        if ( scriptFieldValue.hasMember( "args" ) )
        {
            Map<String, Object> argsMap = scriptFieldValue.getMember( "args" ).getMap();
            argsMap.entrySet().
                stream().
                map( ( argEntry ) -> GraphQLArgument.newArgument().name( argEntry.getKey() ).type(
                    (GraphQLInputType) argEntry.getValue() ).build() ).
                forEach( graphQLArgument -> graphQlField.argument( graphQLArgument ) );
        }
    }

    private void setFieldType( final ScriptValue scriptFieldValue, final GraphQLFieldDefinition.Builder graphQlField )
    {
        final Object scriptFieldType = scriptFieldValue.getMember( "type" ).getValue();
        if ( scriptFieldType instanceof GraphQLObjectType.Builder )
        {
            graphQlField.type( (GraphQLObjectType.Builder) scriptFieldType );
        }
        else if ( scriptFieldType instanceof GraphQLInterfaceType.Builder )
        {
            graphQlField.type( (GraphQLInterfaceType.Builder) scriptFieldType );
        }
        else if ( scriptFieldType instanceof GraphQLUnionType.Builder )
        {
            graphQlField.type( (GraphQLUnionType.Builder) scriptFieldType );
        }
        else if ( scriptFieldType instanceof GraphQLOutputType )
        {
            graphQlField.type( (GraphQLOutputType) scriptFieldType );
        }
    }

    private void setFieldData( final ScriptValue scriptFieldValue, final GraphQLFieldDefinition.Builder graphQlField )
    {
        final ScriptValue data = scriptFieldValue.getMember( "data" );
        if ( data.isFunction() )
        {
            graphQlField.dataFetcher( ( env ) -> {
                final ScriptValue result = data.call( env );
                return toGraphQlValue( result );
            } );
        }
        else
        {
            graphQlField.staticValue( toGraphQlValue( data ) );
        }
    }

    private Object toGraphQlValue( final ScriptValue data )
    {
        if ( data.isValue() )
        {
            return data.getValue();
        }
        else if ( data.isObject() )
        {
            return data.getMap();
        }
        else if ( data.isArray() )
        {
            return data.getArray().
                stream().
                map( ( subData ) -> toGraphQlValue( subData ) ).
                collect( Collectors.toList() );
        }
        return null;
    }

    public GraphQLList list( GraphQLObjectType.Builder type )
    {
        return new GraphQLList( type.build() );
    }

    public GraphQLScalarType scalar( final String typeKey )
    {
        return GRAPH_QL_SCALAR_TYPE_MAP.get( typeKey );
    }

    public MapMapper execute( final GraphQLSchema schema, final String request )
    {
        GraphQL graphQL = new GraphQL( schema );
        final ExecutionResult executionResult = graphQL.execute( request );
        if ( executionResult.getErrors() != null && !executionResult.getErrors().isEmpty() )
        {
            System.out.println( "Errors: " + executionResult.getErrors() );
        }
        Map<String, Object> result = (Map<String, Object>) graphQL.execute( request ).getData();
        return new MapMapper( result );
    }
}
