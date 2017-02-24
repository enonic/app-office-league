import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {ListComponent} from './list.component';
import {BaseComponent} from './base.component';
import {RatingComponent} from './rating/rating.component';
import {PlayerSummaryComponent} from './player-summary/player-summary.component';
import {PlayerListComponent} from './player-list/player-list.component';
import {TeamPlayersComponent} from './team-players/team-players.component';


@NgModule({
    declarations: [
        RatingComponent,
        PlayerSummaryComponent,
        PlayerListComponent,
        TeamPlayersComponent,
        BaseComponent,
        ListComponent
    ],
    imports: [
        BrowserModule
    ],
    exports: [
        BrowserModule,
        RatingComponent,
        PlayerSummaryComponent,
        PlayerListComponent,
        TeamPlayersComponent,
        BaseComponent,
        ListComponent
    ]
})
export class CommonModule {
}
