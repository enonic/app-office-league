import {enableProdMode, LOCALE_ID, TRANSLATIONS_FORMAT, TRANSLATIONS, StaticProvider} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';
import {XPCONFIG} from './app/app.config';


declare const require;

// It was: process?.env?.ENV === 'production', But web app cannot access to node process
if (false) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule, {
    providers: getTranslationProviders()
});

function getTranslationProviders(): any {
    // Get the locale id from the global
    const locale = XPCONFIG?.locale ?? 'ru';
    // return no providers if fail to get translation file for locale
    const noProviders: StaticProvider[] = [];
    // No locale or U.S. English: no translation providers
    if (!locale || locale === 'en') {
        return noProviders;
    }
    // Ex: 'locale/messages.es.xlf`
    // const translationFile = `locale/messages.${locale}.xlf`;

    const translations = require('raw-loader!./assets/locale/messages.' + locale + '.xlf').default;
    return [
        {provide: TRANSLATIONS, useValue: translations},
        {provide: TRANSLATIONS_FORMAT, useValue: 'xlf'},
        {provide: LOCALE_ID, useValue: locale}
      ];
}