package com.enonic.app.officeleague.graphql;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import com.google.common.collect.ImmutableMap;

import graphql.ExecutionResult;
import graphql.GraphQL;
import graphql.GraphQLError;
import graphql.Scalars;
import graphql.execution.SimpleExecutionStrategy;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLInputType;
import graphql.schema.GraphQLInterfaceType;
import graphql.schema.GraphQLList;
import graphql.schema.GraphQLObjectType;
import graphql.schema.GraphQLOutputType;
import graphql.schema.GraphQLScalarType;
import graphql.schema.GraphQLSchema;
import graphql.schema.GraphQLTypeReference;
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
        setTypeFields( scriptValue, type );
        return type;
    }

    private void setTypeFields( final ScriptValue scriptValue, final GraphQLObjectType.Builder type )
    {
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
                final DataFetchingEnvironmentMapper environmentMapper = new DataFetchingEnvironmentMapper( env );
                final ScriptValue result = data.call( environmentMapper );
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
        if ( data != null )
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

    public GraphQLTypeReference reference( final String typeKey )
    {
        return new GraphQLTypeReference( typeKey );
    }

    public MapMapper execute( final GraphQLSchema schema, final String request )
    {
        Map<String, Object> resultMap = new HashMap();

        GraphQL graphQL = new GraphQL( schema, new SimpleExecutionStrategy() );
        final ExecutionResult executionResult = graphQL.execute( request );
        resultMap.put( "data", graphQL.execute( request ).getData() );
        resultMap.put( "errors", executionResult.getErrors().stream().map( GraphQlBean::toMap ).collect( Collectors.toList() ) );
        return new MapMapper( resultMap );
    }

    private static Map<String, Object> toMap( final GraphQLError error )
    {
        Map<String, Object> errorAsMap = new HashMap<>();
        errorAsMap.put( "errorType", error.getErrorType() );
        errorAsMap.put( "message", error.getMessage() );
        errorAsMap.put( "locations", error.getLocations() );
        return errorAsMap;
    }
}
