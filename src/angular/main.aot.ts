import './styles.less';
import {enableProdMode} from '@angular/core';
import {loadTranslations} from '@angular/localize';
import {platformBrowser} from '@angular/platform-browser';
import {AppModule} from './app/app.module';
import {Config} from './app/app.config';
import {MESSAGES_RU} from './locale/messages.ru';

declare var XPCONFIG: Config;

enableProdMode();

// $localize messages are resolved lazily at first render, so translations must be in place before bootstrap
if (XPCONFIG.locale === 'ru') {
    loadTranslations(MESSAGES_RU);
}

platformBrowser().bootstrapModule(AppModule);
