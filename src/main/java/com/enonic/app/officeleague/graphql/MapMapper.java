package com.enonic.app.officeleague.graphql;

import java.util.List;
import java.util.Map;

import com.enonic.xp.script.serializer.MapGenerator;
import com.enonic.xp.script.serializer.MapSerializable;

public final class MapMapper
    implements MapSerializable
{
    private final Map<String, Object> value;

    public MapMapper( final Map<String, Object> value )
    {
        this.value = value;
    }

    @Override
    public void serialize( final MapGenerator gen )
    {
        if ( this.value != null )
        {
            serializeMap( gen, this.value );
        }
    }

    private static void serializeMap( final MapGenerator gen, final Map<?, ?> map )
    {
        for ( final Map.Entry<?, ?> entry : map.entrySet() )
        {
            serializeKeyValue( gen, entry.getKey().toString(), entry.getValue() );
        }
    }

    private static void serializeKeyValue( final MapGenerator gen, final String key, final Object value )
    {
        if ( value instanceof List )
        {
            serializeList( gen, key, (List<?>) value );
        }
        else if ( value instanceof Map )
        {
            serializeMap( gen, key, (Map<?, ?>) value );
        }
        else
        {
            gen.value( key, value );
        }
    }

    private static void serializeList( final MapGenerator gen, final String key, final List<?> values )
    {
        gen.array( key );
        for ( final Object value : values )
        {
            serializeValue( gen, value );
        }
        gen.end();
    }

    private static void serializeMap( final MapGenerator gen, final String key, final Map<?, ?> map )
    {
        gen.map( key );
        serializeMap( gen, map );
        gen.end();
    }

    private static void serializeValue( final MapGenerator gen, final Object value )
    {
        if ( value instanceof Map )
        {
            gen.map();
            serializeMap( gen, (Map<?, ?>) value );
            gen.end();
        }
        else
        {
            gen.value( value );
        }
    }
}
