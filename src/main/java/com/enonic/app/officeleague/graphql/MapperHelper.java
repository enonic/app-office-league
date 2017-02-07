package com.enonic.app.officeleague.graphql;

import java.util.Map;

import com.enonic.xp.script.serializer.MapGenerator;

public final class MapperHelper
{
    public static void serializeMap( final String name, final MapGenerator gen, final Object map )
    {
        if ( map instanceof Map )
        {
            gen.map( name );
            new MapMapper( (Map<?, ?>) map ).serialize( gen );
            gen.end();
        }
    }
}
