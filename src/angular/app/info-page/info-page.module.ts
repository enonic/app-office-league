import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '../common/common.module';
import {InfoPageComponent} from './info-page.component';
import {FormsModule} from '@angular/forms';
import {PlayerRouteGuard, } from '../guards/player.route.guard';
import { MaterializeModule } from 'angular2-materialize';

const pageInfoRoutes: Routes = [
    {path: ':info-page', component: InfoPageComponent, canActivate: [PlayerRouteGuard,]}
];

@NgModule({
    declarations: [
        InfoPageComponent
    ],
    imports: [
        CommonModule,
        MaterializeModule,
        RouterModule.forChild(pageInfoRoutes),
        FormsModule
    ],
    exports: [],
    providers: [],
    bootstrap: []
})
export class InfoPageModule {
}
