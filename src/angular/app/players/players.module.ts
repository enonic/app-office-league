import {NgModule} from '@angular/core';
import {PlayerListComponent} from '../common/player-list/player-list.component';
import {RouterModule, Routes} from '@angular/router';
import {GamesModule} from '../games/games.module';
import {CommonModule} from '../common/common.module';
import {PlayerProfileComponent} from './player-profile/player-profile.component';
import {PlayerStatsComponent} from './player-stats/player-stats.component';
import {LeaguesModule} from '../leagues/league.module';
import {TeamsModule} from '../teams/team.module';

const playersRoutes: Routes = [
    {path: 'players', component: PlayerListComponent, data: {}},
    {path: 'players/:name', component: PlayerProfileComponent, data: {}},
];

@NgModule({
    declarations: [
        PlayerProfileComponent,
        PlayerStatsComponent
    ],
    imports: [
        CommonModule,
        GamesModule,
        LeaguesModule,
        TeamsModule,
        RouterModule.forChild(playersRoutes),
    ],
    exports: [],
    providers: [],
    bootstrap: []
})
export class PlayersModule {
}
