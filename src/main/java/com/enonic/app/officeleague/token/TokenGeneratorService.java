package com.enonic.app.officeleague.token;

import java.math.BigInteger;
import java.security.SecureRandom;

import org.osgi.service.component.annotations.Component;

@Component(immediate = true)
public class TokenGeneratorService
{
    private static final int CHAR_BITS = 5;

    private static final int NB_CHARACTERS = 32;

    private static final int NB_BITS = NB_CHARACTERS * CHAR_BITS;

    private static final int RADIX = (int) Math.pow( 2, CHAR_BITS );

    private final SecureRandom secureRandom = new SecureRandom();

    public synchronized String generateToken()
    {
        StringBuilder token = new StringBuilder();
        final BigInteger bigInteger = new BigInteger( NB_BITS, secureRandom );
        for ( int i = 0; i < ( NB_BITS - ( bigInteger.bitLength() ) ) / CHAR_BITS; i++ )
        {
            token.append( '0' );
        }
        token.append( bigInteger.toString( RADIX ) );
        return token.toString();
    }
}
