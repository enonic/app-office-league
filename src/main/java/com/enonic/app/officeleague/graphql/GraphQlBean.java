package com.enonic.app.officeleague.graphql;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import graphql.ExecutionResult;
import graphql.GraphQL;
import graphql.GraphQLError;
import graphql.execution.SimpleExecutionStrategy;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLInputType;
import graphql.schema.GraphQLInterfaceType;
import graphql.schema.GraphQLList;
import graphql.schema.GraphQLObjectType;
import graphql.schema.GraphQLOutputType;
import graphql.schema.GraphQLSchema;
import graphql.schema.GraphQLType;
import graphql.schema.GraphQLTypeReference;
import graphql.schema.GraphQLUnionType;

import com.enonic.xp.script.ScriptValue;

public class GraphQlBean
{
    public GraphQLSchema createSchema( final GraphQLObjectType.Builder queryObjectType, final GraphQLObjectType.Builder mutationObjectType )
    {
        final GraphQLSchema.Builder graphQLSchema = GraphQLSchema.newSchema().query( queryObjectType );
        if ( mutationObjectType != null )
        {
            graphQLSchema.mutation( mutationObjectType );

        }
        return graphQLSchema.build();
    }

    public GraphQLObjectType.Builder createObjectType( final String name, final ScriptValue fieldsScriptValue,
                                                       final ScriptValue interfacesScriptValue, final String description )
    {
        final GraphQLObjectType.Builder objectType = GraphQLObjectType.newObject().
            name( name ).
            description( description );
        if ( interfacesScriptValue != null )
        {
            interfacesScriptValue.getArray().
                forEach( ( interfaceScriptValue ) -> objectType.withInterface( (GraphQLInterfaceType) interfaceScriptValue.getValue() ) );
        }
        setTypeFields( fieldsScriptValue, objectType );
        return objectType;
    }

    public GraphQLInterfaceType createInterfaceType( final String name, final ScriptValue fieldsScriptValue, final String description )
    {
        final GraphQLInterfaceType.Builder interfaceType = GraphQLInterfaceType.newInterface().
            name( name ).
            typeResolver( ( object ) -> null ). //TODO
            description( description );
        setTypeFields( fieldsScriptValue, interfaceType );
        return interfaceType.build();
    }

    private void setTypeFields( final ScriptValue fieldsScriptValue, final GraphQLObjectType.Builder objectType )
    {
        for ( String fieldKey : fieldsScriptValue.getKeys() )
        {
            final ScriptValue fieldScriptValue = fieldsScriptValue.getMember( fieldKey );

            final GraphQLFieldDefinition.Builder graphQlField = GraphQLFieldDefinition.newFieldDefinition().
                name( fieldKey );

            setFieldArguments( fieldScriptValue, graphQlField );
            setFieldType( fieldScriptValue, graphQlField );
            setFieldData( fieldScriptValue, graphQlField );
            objectType.field( graphQlField );
        }
    }

    private void setTypeFields( final ScriptValue fieldsScriptValue, final GraphQLInterfaceType.Builder interfaceType )
    {
        for ( String fieldKey : fieldsScriptValue.getKeys() )
        {
            final ScriptValue fieldScriptValue = fieldsScriptValue.getMember( fieldKey );

            final GraphQLFieldDefinition.Builder graphQlField = GraphQLFieldDefinition.newFieldDefinition().
                name( fieldKey );

            setFieldArguments( fieldScriptValue, graphQlField );
            setFieldType( fieldScriptValue, graphQlField );
            setFieldData( fieldScriptValue, graphQlField );
            interfaceType.field( graphQlField );
        }
    }

    private void setFieldArguments( final ScriptValue fieldScriptValue, final GraphQLFieldDefinition.Builder graphQlField )
    {
        if ( fieldScriptValue.hasMember( "args" ) )
        {
            Map<String, Object> argsMap = fieldScriptValue.getMember( "args" ).getMap();
            argsMap.entrySet().
                stream().
                map( ( argEntry ) -> GraphQLArgument.newArgument().name( argEntry.getKey() ).type(
                    (GraphQLInputType) argEntry.getValue() ).build() ).
                forEach( graphQLArgument -> graphQlField.argument( graphQLArgument ) );
        }
    }

    private void setFieldType( final ScriptValue fieldScriptValue, final GraphQLFieldDefinition.Builder graphQlField )
    {
        final Object scriptFieldType = fieldScriptValue.getMember( "type" ).getValue();
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

    public GraphQLList list( GraphQLType type )
    {
        return new GraphQLList( type );
    }

    public GraphQLTypeReference reference( final String typeKey )
    {
        return new GraphQLTypeReference( typeKey );
    }

    public MapMapper execute( final GraphQLSchema schema, final String request )
    {
        GraphQL graphQL = new GraphQL( schema, new SimpleExecutionStrategy() );
        final ExecutionResult executionResult = graphQL.execute( request );

        Map<String, Object> resultMap = new HashMap();
        resultMap.put( "data", executionResult.getData() );
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
