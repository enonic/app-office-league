import {enableProdMode, LOCALE_ID, TRANSLATIONS_FORMAT, TRANSLATIONS} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app/app.module';
import {XPCONFIG} from './app/app.config';

if (process.env.ENV === 'production') {
    enableProdMode();
}
declare var $: any;

getTranslationProviders().then(providers => {
    platformBrowserDynamic().bootstrapModule(AppModule, {
        providers: providers
    });
});

export function getTranslationProviders(): Promise<Object[]> {
    // Get the locale id from the global
    const locale = XPCONFIG.locale;
    // return no providers if fail to get translation file for locale
    const noProviders: Object[] = [];
    // No locale or U.S. English: no translation providers
    if (!locale || locale === 'en') {
        return Promise.resolve(noProviders);
    }
    // Ex: 'locale/messages.es.xlf`
    const translationFile = `assets/locale/messages.${locale}.xlf`;

    return $.get(translationFile)
        .then((translations: string) => [
            {provide: TRANSLATIONS, useValue: translations},
            {provide: TRANSLATIONS_FORMAT, useValue: 'xlf'},
            {provide: LOCALE_ID, useValue: locale}
        ])
        .catch(() => noProviders); // ignore if file not found
}