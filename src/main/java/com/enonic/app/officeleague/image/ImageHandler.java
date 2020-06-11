package com.enonic.app.officeleague.image;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.util.function.Supplier;

import javax.imageio.ImageIO;

import com.google.common.base.Strings;
import com.google.common.io.ByteSource;

import com.enonic.xp.content.ContentId;
import com.enonic.xp.image.ImageService;
import com.enonic.xp.image.ReadImageParams;
import com.enonic.xp.image.ScaleParams;
import com.enonic.xp.media.ImageOrientation;
import com.enonic.xp.media.MediaInfoService;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.util.BinaryReference;

public final class ImageHandler
    implements ScriptBean
{
    private final static int DEFAULT_BACKGROUND = 0x00FFFFFF;

    private Supplier<ImageService> imageService;

    private Supplier<MediaInfoService> mediaInfoService;

    private String id;

    private String name;

    private String scale;

    private Double quality;

    private Double orientation;

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

    public int getImageOrientation( final Object imageSource )
    {
        if ( !( imageSource instanceof ByteSource ) )
        {
            return ImageOrientation.TopLeft.getValue();
        }
        ImageOrientation orientation = this.mediaInfoService.get().getImageOrientation( (ByteSource) imageSource );
        orientation = orientation == null ? ImageOrientation.TopLeft : orientation;
        return orientation.getValue();
    }

    public boolean isValidImage( final Object imageSource )
        throws IOException
    {
        if ( !( imageSource instanceof ByteSource ) )
        {
            return false;
        }

        final BufferedImage image = toBufferedImage( ( (ByteSource) imageSource ).openStream() );
        return image != null;
    }

    private BufferedImage toBufferedImage( final InputStream inputStream )
    {
        try
        {
            return ImageIO.read( inputStream );
        }
        catch ( IOException e )
        {
            return null;
        }
    }

    private ReadImageParams getImageParams()
        throws IOException
    {
        final ReadImageParams.Builder params = ReadImageParams.newImageParams();
        params.contentId( ContentId.from( this.id ) );
        params.binaryReference( BinaryReference.from( this.name ) );
        params.scaleParams( parseScaleParams( this.scale ) );
        if ( this.background != null )
        {
            params.backgroundColor( getBackgroundColor() );
        }
        params.mimeType(this.mimeType);
        
        if ( orientation != null )
        {
            params.orientation( ImageOrientation.valueOf( orientation.intValue() ) );
        }

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
            final String paramStr = params.substring( params.indexOf( "(" ) + 1, end );
            args = paramStr.split( "," );
        }
        else
        {
            name = params;
        }
        return new ScaleParams( name, args );
    }

    private int getBackgroundColor()
    {
        if ( Strings.isNullOrEmpty( this.background ) )
        {
            return DEFAULT_BACKGROUND;
        }

        String color = this.background;
        if ( color.startsWith( "0x" ) )
        {
            color = this.background.substring( 2 );
        }

        try
        {
            return Integer.parseInt( color, 16 );
        }
        catch ( final Exception e )
        {
            return DEFAULT_BACKGROUND;
        }
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

    public void setOrientation( final Double orientation )
    {
        this.orientation = orientation;
    }

    @Override
    public void initialize( final BeanContext context )
    {
        this.imageService = context.getService( ImageService.class );
        this.mediaInfoService = context.getService( MediaInfoService.class );
    }
}
