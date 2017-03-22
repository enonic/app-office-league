import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {ListComponent} from './list.component';
import {List2Component} from './list2.component';
import {BaseComponent} from './base.component';
import {RatingComponent} from './rating/rating.component';
import {PlayerSummaryComponent} from './player-summary/player-summary.component';
import {PlayerListComponent} from './player-list/player-list.component';
import {TeamSummaryComponent} from './team-summary/team-summary.component';
import {TeamListComponent} from './team-list/team-list.component';
import {TeamPlayersComponent} from './team-players/team-players.component';
import {LoadingComponent} from './loading/loading.component';
import {PlayerSelectComponent} from './player-select/player-select.component';


@NgModule({
    declarations: [
        RatingComponent,
        PlayerSummaryComponent,
        PlayerListComponent,
        TeamSummaryComponent,
        TeamListComponent,
        TeamPlayersComponent,
        BaseComponent,
        ListComponent,
        List2Component,
        LoadingComponent,
        PlayerSelectComponent
    ],
    imports: [
        BrowserModule,
        FormsModule
    ],
    exports: [
        BrowserModule,
        RatingComponent,
        PlayerSummaryComponent,
        PlayerListComponent,
        TeamSummaryComponent,
        TeamListComponent,
        TeamPlayersComponent,
        BaseComponent,
        ListComponent,
        List2Component,
        LoadingComponent,
        PlayerSelectComponent
    ]
})
export class CommonModule {
}
