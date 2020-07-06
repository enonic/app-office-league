import './styles.less';
import 'zone.js/dist/zone';
import {AppModule} from './app/app.module';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {NgZone, enableProdMode} from '@angular/core';

declare var $: any;

if (process.env.ENV === 'production') {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, { ngZone: new NgZone({}) });