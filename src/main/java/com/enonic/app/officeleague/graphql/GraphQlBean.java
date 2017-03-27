package com.enonic.app.officeleague.graphql;

import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;

import graphql.ExecutionResult;
import graphql.GraphQL;
import graphql.execution.SimpleExecutionStrategy;
import graphql.schema.GraphQLArgument;
import graphql.schema.GraphQLEnumType;
import graphql.schema.GraphQLFieldDefinition;
import graphql.schema.GraphQLInputObjectField;
import graphql.schema.GraphQLInputObjectType;
import graphql.schema.GraphQLInputType;
import graphql.schema.GraphQLInterfaceType;
import graphql.schema.GraphQLList;
import graphql.schema.GraphQLNonNull;
import graphql.schema.GraphQLObjectType;
import graphql.schema.GraphQLOutputType;
import graphql.schema.GraphQLSchema;
import graphql.schema.GraphQLType;
import graphql.schema.GraphQLTypeReference;
import graphql.schema.GraphQLUnionType;

import com.enonic.xp.script.ScriptValue;

public class GraphQlBean
{
    public GraphQLSchema createSchema( final GraphQLObjectType queryObjectType, final GraphQLObjectType mutationObjectType )
    {
        final GraphQLSchema.Builder graphQLSchema = GraphQLSchema.newSchema().query( queryObjectType );
        if ( mutationObjectType != null )
        {
            graphQLSchema.mutation( mutationObjectType );

        }
        return graphQLSchema.build();
    }

    public GraphQLObjectType createObjectType( final String name, final ScriptValue fieldsScriptValue,
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
        return objectType.build();
    }

    public GraphQLInputObjectType createInputObjectType( final String name, final ScriptValue fieldsScriptValue, final String description )
    {
        final GraphQLInputObjectType.Builder objectType = GraphQLInputObjectType.newInputObject().
            name( name ).
            description( description );
        setTypeFields( fieldsScriptValue, objectType );
        return objectType.build();
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

    public GraphQLEnumType createEnumType( final String name, final ScriptValue valuesScriptValue, final String description )
    {
        final GraphQLEnumType.Builder enumType = GraphQLEnumType.newEnum().
            name( name ).
            description( description );
        setValues( valuesScriptValue, enumType );
        return enumType.build();
    }

    private void setValues( final ScriptValue valuesScriptValue, final GraphQLEnumType.Builder enumType )
    {
        for ( String valueKey : valuesScriptValue.getKeys() )
        {
            final ScriptValue valueScriptValue = valuesScriptValue.getMember( valueKey );
            enumType.value( valueKey, valueScriptValue.getValue() );
        }
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

    private void setTypeFields( final ScriptValue fieldsScriptValue, final GraphQLInputObjectType.Builder objectType )
    {
        for ( String fieldKey : fieldsScriptValue.getKeys() )
        {
            final ScriptValue fieldScriptValue = fieldsScriptValue.getMember( fieldKey );

            final GraphQLInputObjectField.Builder graphQlField = GraphQLInputObjectField.newInputObjectField().
                name( fieldKey );

            setFieldType( fieldScriptValue, graphQlField );
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

    private void setFieldType( final ScriptValue fieldScriptValue, final GraphQLInputObjectField.Builder graphQlField )
    {
        final Object scriptFieldType = fieldScriptValue.getMember( "type" ).getValue();
        if ( scriptFieldType instanceof GraphQLInputObjectType.Builder )
        {
            graphQlField.type( (GraphQLInputObjectType.Builder) scriptFieldType );
        }
        else if ( scriptFieldType instanceof GraphQLInputType )
        {
            graphQlField.type( (GraphQLInputType) scriptFieldType );
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

    public GraphQLList list( GraphQLType type )
    {
        return new GraphQLList( type );
    }

    public GraphQLNonNull nonNull( GraphQLType type )
    {
        return new GraphQLNonNull( type );
    }

    public GraphQLTypeReference reference( final String typeKey )
    {
        return new GraphQLTypeReference( typeKey );
    }

    public ExecutionResultMapper execute( final GraphQLSchema schema, final String query, final ScriptValue variables )
    {
        GraphQL graphQL = new GraphQL( schema, new SimpleExecutionStrategy() );
        final Map<String, Object> variablesMap = variables == null ? Collections.<String, Object>emptyMap() : variables.getMap();
        final ExecutionResult executionResult = graphQL.execute( query, (Object) null, variablesMap );

        return new ExecutionResultMapper( executionResult );
    }
}
