package com.enonic.app.officeleague;

import java.io.IOException;

import org.osgi.service.component.annotations.Component;

import com.google.common.io.ByteSource;

import com.enonic.xp.web.HttpStatus;
import com.enonic.xp.web.WebRequest;
import com.enonic.xp.web.WebResponse;
import com.enonic.xp.web.handler.BaseWebHandler;
import com.enonic.xp.web.handler.WebHandler;
import com.enonic.xp.web.handler.WebHandlerChain;

@Component(immediate = true, service = WebHandler.class)
public class RangeWebHandler
    extends BaseWebHandler
{
    public RangeWebHandler()
    {
        super( -20 );
    }

    @Override
    protected boolean canHandle( final WebRequest webRequest )
    {
        return webRequest.getPath().contains( "/_/attachment/" );
    }

    @Override
    protected WebResponse doHandle( final WebRequest webRequest, final WebResponse webResponse, final WebHandlerChain webHandlerChain )
        throws Exception
    {
        final WebResponse response = webHandlerChain.handle( webRequest, webResponse );
        if ( response.getStatus() == HttpStatus.OK &&
            ( webRequest.getHeaders().containsKey( "Range" ) || webRequest.getHeaders().containsKey( "range" ) ) &&
            response.getBody() instanceof ByteSource )
        {
            return handleRangeRequest( webRequest, response );
        }

        return webResponse;
    }


    public WebResponse handleRangeRequest( final WebRequest request, final WebResponse response )
        throws IOException
    {
        final WebResponse.Builder newResponse = WebResponse.create( response );

        newResponse.status( HttpStatus.PARTIAL_CONTENT );

        String rangeHeader = request.getHeaders().getOrDefault( "Range", "" ).trim();
        rangeHeader = !rangeHeader.isEmpty() ? rangeHeader : request.getHeaders().getOrDefault( "Range", "" ).trim();
        String rangeValue = rangeHeader.length() > "bytes=".length() ? rangeHeader.substring( "bytes=".length() ) : "";

        ByteSource body = (ByteSource) response.getBody();
        long fileLength = body.size();
        long start, end;
        if ( rangeValue.startsWith( "-" ) )
        {
            end = fileLength - 1;
            start = fileLength - 1 - Long.parseLong( rangeValue.substring( "-".length() ) );
        }
        else
        {
            String[] range = rangeValue.split( "-" );
            start = Long.parseLong( range[0] );
            end = range.length > 1 ? Long.parseLong( range[1] ) : fileLength - 1;
        }
        if ( end > fileLength - 1 )
        {
            end = fileLength - 1;
        }
        if ( start <= end )
        {
            long contentLength = end - start + 1;
            newResponse.header( "Content-Length", contentLength + "" );
            newResponse.header( "Content-Range", "bytes " + start + "-" + end + "/" + fileLength );
            newResponse.body( body.slice( start, end - start + 1 ) );
        }
        return newResponse.build();
    }
}
