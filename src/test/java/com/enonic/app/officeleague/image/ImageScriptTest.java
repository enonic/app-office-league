package com.enonic.app.officeleague.image;

import com.google.common.io.ByteSource;

import com.enonic.xp.image.ImageService;
import com.enonic.xp.media.MediaInfoService;
import com.enonic.xp.testing.ScriptRunnerSupport;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ImageScriptTest
    extends ScriptRunnerSupport
{
    @Override
    protected void initialize()
        throws Exception
    {
        super.initialize();

        final ImageService imageService = mock( ImageService.class );
        when( imageService.readImage( any() ) ).thenReturn( ByteSource.wrap( new byte[]{1, 2, 3} ) );
        addService( ImageService.class, imageService );
        addService( MediaInfoService.class, mock( MediaInfoService.class ) );
    }

    @Override
    public String getScriptTestFile()
    {
        return "/lib/image-test.js";
    }
}
