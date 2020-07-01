import './styles.less';
import {AppModule} from './app/app.module';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

declare var $: any;

platformBrowserDynamic().bootstrapModule(AppModule);