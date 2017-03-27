package com.enonic.app.officeleague.graphql;

import java.util.Map;

import graphql.ExceptionWhileDataFetching;
import graphql.ExecutionResult;
import graphql.GraphQLError;
import graphql.language.SourceLocation;
import graphql.validation.ValidationError;
import graphql.validation.ValidationErrorType;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public class ExecutionResultMapper
    implements MapSerializable
{
    private final ExecutionResult executionResult;

    public ExecutionResultMapper( final ExecutionResult executionResult )
    {
        this.executionResult = executionResult;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        serializeData( gen );
        serializeErrors( gen );

    }

    private void serializeData( final MapGenerator gen )
    {
        if ( executionResult.getData() instanceof Map )
        {
            gen.map( "data" );
            new MapMapper( (Map<?, ?>) executionResult.getData() ).serialize( gen );
            gen.end();
        }
    }

    private void serializeErrors( final MapGenerator gen )
    {
        if ( executionResult.getErrors() != null && !executionResult.getErrors().isEmpty() )
        {
            gen.array( "errors" );
            executionResult.getErrors().
                forEach( ( error ) -> this.serializeError( gen, error ) );
            gen.end();
        }
    }

    private void serializeError( final MapGenerator gen, final GraphQLError error )
    {
        gen.map();
        gen.value( "errorType", error.getErrorType() );
        gen.value( "message", error.getMessage() );

        if ( error.getLocations() != null )
        {
            gen.array( "locations" );
            for ( SourceLocation location : error.getLocations() )
            {
                gen.map();
                gen.value( "line", location.getLine() );
                gen.value( "column", location.getColumn() );
                gen.end();
            }
            gen.end();
        }

        if ( error instanceof ValidationError )
        {
            final ValidationErrorType validationErrorType = ( (ValidationError) error ).getValidationErrorType();
            gen.value( "validationErrorType", validationErrorType );
        }
        else if ( error instanceof ExceptionWhileDataFetching )
        {
            final Throwable exception = ( (ExceptionWhileDataFetching) error ).getException();
            gen.map( "exception" );
            gen.value( "name", exception.getClass().getName() );
            final String message = exception.getLocalizedMessage();
            if ( message != null )
            {
                gen.value( "message", message );
            }
            gen.end();
        }

        gen.end();
    }
}
