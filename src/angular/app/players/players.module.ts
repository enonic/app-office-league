import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GamesModule} from '../games/games.module';
import {CommonModule} from '../common/common.module';
import {PlayerProfileComponent} from './player-profile/player-profile.component';
import {PlayerStatsComponent} from './player-stats/player-stats.component';
import {LeaguesModule} from '../leagues/league.module';
import {TeamsModule} from '../teams/team.module';
import {PlayerEditComponent} from './player-edit/player-edit.component';
import {PlayerTeamListComponent} from './player-team-list/player-team-list.component';
import {PlayerListPageComponent} from './player-list-page/player-list-page.component';
import {PlayerCreateComponent} from './player-new/player-create.component';
import {FormsModule} from '@angular/forms';
import {AuthRouteGuard} from '../auth.route.guard';

const playersRoutes: Routes = [
    {path: 'players', component: PlayerListPageComponent, canActivate: [AuthRouteGuard]},
    {path: 'players/:name', component: PlayerProfileComponent, canActivate: [AuthRouteGuard]},
    {path: 'players/:name/teams', component: PlayerTeamListComponent, canActivate: [AuthRouteGuard]},
    {path: 'players/:name/edit', component: PlayerEditComponent, canActivate: [AuthRouteGuard]},
    {path: 'player-create', component: PlayerCreateComponent},
];

@NgModule({
    declarations: [
        PlayerListPageComponent,
        PlayerProfileComponent,
        PlayerTeamListComponent,
        PlayerStatsComponent,
        PlayerEditComponent,
        PlayerCreateComponent
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
