import './styles.less';
import {enableProdMode} from '@angular/core';
import { AppModule } from  './app/app.module';
import {platformBrowser} from '@angular/platform-browser';

enableProdMode();

declare var $: any;

platformBrowser().bootstrapModule(AppModule);
