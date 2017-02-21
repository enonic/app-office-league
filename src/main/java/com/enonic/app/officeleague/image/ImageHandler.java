package com.enonic.app.officeleague.image;

import java.io.IOException;
import java.util.function.Supplier;

import com.google.common.io.ByteSource;

import com.enonic.xp.content.ContentId;
import com.enonic.xp.image.ImageService;
import com.enonic.xp.image.ReadImageParams;
import com.enonic.xp.image.ScaleParams;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.util.BinaryReference;

public final class ImageHandler
    implements ScriptBean
{
    private Supplier<ImageService> imageService;

    private String id;

    private String name;

    private String scale;

    private Double quality;

    private String background;

    private String format;

    private String mimeType;

    private String filter;

    public ByteSource process()
        throws IOException
    {
        final ImageService imgSvc = imageService.get();
        final ReadImageParams params = getImageParams();
        return imgSvc.readImage( params );
    }

    private ReadImageParams getImageParams()
        throws IOException
    {
        final ReadImageParams.Builder params = ReadImageParams.newImageParams();
        params.contentId( ContentId.from( this.id ) );
        params.binaryReference( BinaryReference.from( this.name ) );
        params.scaleParams( parseScaleParams( this.scale ) );

        String format = this.format;
        if ( format == null && this.mimeType != null )
        {
            format = imageService.get().getFormatByMimeType( this.mimeType );
        }
        if ( format == null )
        {
            format = "png";
        }

        params.format( format );
        return params.build();
    }

    private ScaleParams parseScaleParams( final String params )
    {
        final String name;
        Object[] args = new Object[0];
        if ( params.contains( "(" ) )
        {
            name = params.substring( 0, params.indexOf( "(" ) );
            final int end = params.contains( ")" ) ? params.indexOf( ")" ) : params.length();
            final String paramStr = params.substring( params.indexOf( "(" )+1, end );
            args = paramStr.split( "," );
        }
        else
        {
            name = params;
        }
        return new ScaleParams( name, args );
    }

    public void setId( final String id )
    {
        this.id = id;
    }

    public void setName( final String name )
    {
        this.name = name;
    }

    public void setScale( final String scale )
    {
        this.scale = scale;
    }

    public void setQuality( final Double quality )
    {
        this.quality = quality;
    }

    public void setBackground( final String background )
    {
        this.background = background;
    }

    public void setFormat( final String format )
    {
        this.format = format;
    }

    public void setMimeType( final String mimeType )
    {
        this.mimeType = mimeType;
    }

    public void setFilter( final String filter )
    {
        this.filter = filter;
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.imageService = context.getService( ImageService.class );
    }
}
