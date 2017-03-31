import './styles.less';
import {enableProdMode} from '@angular/core';
import { AppModuleNgFactory } from  './assets/aot/src/angular/app/app.module.ngfactory';
import {platformBrowser} from '@angular/platform-browser';

enableProdMode();

declare var $: any;

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);
