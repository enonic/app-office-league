package com.enonic.app.officeleague.push;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.concurrent.ExecutionException;

import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.jose4j.lang.JoseException;

import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Utils;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class PushBean
    implements ScriptBean
{
    static
    {
        if ( Security.getProvider( BouncyCastleProvider.PROVIDER_NAME ) != null )
        {
            Security.removeProvider( BouncyCastleProvider.PROVIDER_NAME );
        }
        Security.addProvider( new BouncyCastleProvider() );
    }

    private String endpoint;

    private String userPublicKey;

    private String userAuth;

    public void setEndpoint( final String endpoint )
    {
        this.endpoint = endpoint;
    }

    public void setUserPublicKey( final String userPublicKey )
    {
        this.userPublicKey = userPublicKey;
    }

    public void setUserAuth( final String userAuth )
    {
        this.userAuth = userAuth;
    }

    public void send( final String payload )
        throws InterruptedException, GeneralSecurityException, JoseException, ExecutionException, IOException
    {
        final Notification notification = new Notification( this.endpoint, this.userPublicKey, this.userAuth, payload );
        System.out.println( notification );

        final PushService pushService = new PushService();
        pushService.setPublicKey(
            Utils.loadPublicKey( "BJCTKN2sEl2USb7aBHzPmZQZXtii1oSK35h0qtidgoXvovvXWIZIi9F31gkwHg93dNIzQ1yYGE1PVrQopW2fT9E" ) );
        pushService.setPrivateKey( Utils.loadPrivateKey( "V0fz7xxqwHipIf3nn80VNwP5K8ljzSQ132VMWjaVk5Y" ) );
        final HttpResponse httpResponse = pushService.send( notification );
        System.out.println( httpResponse );
    }

    public static void main( String[] args )
        throws InterruptedException, GeneralSecurityException, JoseException, ExecutionException, IOException
    {
        final PushBean pushBean = new PushBean();
        pushBean.endpoint =
            "https://fcm.googleapis.com/fcm/send/fZoEwMriqaA:APA91bGmRNr_CwZ4g0MOTNggRe_lnJ1rrde8sOaYeL7EDeGP7jQAeLQRZYgTAoSAIKedmpUmQTEET7PeRGOCl-ouVrM29j7ZxGxSIktK5CprcVXIvPF8LzEzhhFbJrauncJ5FfwFQ-7m";
        pushBean.userPublicKey = "BCnAP0JzZvIpsBf089yzTxaYYyRgESPIQmK1MXsn7OqNaAvx2T/j8bbGVlZpjeIgGGynhhVTeEKikuUBQKbillI=";
        pushBean.userAuth = "EvZhW07waGmjzhfWvEhu5w==";
        pushBean.send( "Test" );
    }

    @Override
    public void initialize( final BeanContext context )
    {
    }
}
