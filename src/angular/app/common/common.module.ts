import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RatingComponent} from './rating/rating.component';
import {PlayerComponent} from './player/player.component';
import {ListComponent} from './list.component';
import {BaseComponent} from './base.component';
import {PlayerListComponent} from './player-list/player-list.component';
import {TeamPlayersComponent} from './team-players/team-players.component';


@NgModule({
    declarations: [
        RatingComponent,
        PlayerComponent,
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
        PlayerComponent,
        PlayerListComponent,
        TeamPlayersComponent,
        BaseComponent,
        ListComponent
    ]
})
export class CommonModule {
}
