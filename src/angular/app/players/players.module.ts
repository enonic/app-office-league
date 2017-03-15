import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GamesModule} from '../games/games.module';
import {CommonModule} from '../common/common.module';
import {PlayerProfileComponent} from './player-profile/player-profile.component';
import {PlayerStatsComponent} from './player-stats/player-stats.component';
import {LeaguesModule} from '../leagues/league.module';
import {TeamsModule} from '../teams/team.module';
import {PlayerEditComponent} from './player-edit/player-edit.component';
import {PlayerListPageComponent} from './player-list-page/player-list-page.component';
import {FormsModule} from '@angular/forms';

const playersRoutes: Routes = [
    {path: 'players', component: PlayerListPageComponent, data: {}},
    {path: 'players/:name', component: PlayerProfileComponent, data: {}},
    {path: 'players/:name/edit', component: PlayerEditComponent, data: {}},
];

@NgModule({
    declarations: [
        PlayerListPageComponent,
        PlayerProfileComponent,
        PlayerStatsComponent,
        PlayerEditComponent
    ],
    imports: [
        CommonModule,
        GamesModule,
        LeaguesModule,
        TeamsModule,
        RouterModule.forChild(playersRoutes),
        FormsModule
    ],
    exports: [],
    providers: [],
    bootstrap: []
})
export class PlayersModule {
}
