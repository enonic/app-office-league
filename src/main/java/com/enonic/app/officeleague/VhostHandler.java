package com.enonic.app.officeleague;

import com.enonic.xp.portal.PortalRequest;
import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;
import com.enonic.xp.web.vhost.VirtualHostHelper;

public class VhostHandler
    implements ScriptBean
{
    protected PortalRequest request;

    @Override
    public void initialize( final BeanContext context )
    {
        this.request = context.getBinding( PortalRequest.class ).get();
    }

    public String getVirtualHost() {
        return VirtualHostHelper.getVirtualHost(this.request.getRawRequest())
            .getHost();

    }
}