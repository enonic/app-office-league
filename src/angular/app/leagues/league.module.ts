import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '../common/common.module';
import {LeagueSummaryComponent} from './league-summary/league-summary.component';
import {LeagueBrowserComponent} from './league-browser/league-browser.component';
import {LeagueListComponent} from './league-list/league-list.component';
import {LeaguePlayerListComponent} from './league-player-list/league-player-list.component';
import {LeagueTeamListComponent} from './league-team-list/league-team-list.component';
import {GamesModule} from '../games/games.module';
import {LeagueProfileComponent} from './league-profile/league-profile.component';
import {LeagueProfilePlayersComponent} from './league-profile-players/league-profile-players.component';
import {LeagueProfileTeamsComponent} from './league-profile-teams/league-profile-teams.component';
import {LeagueEditCreateComponent} from './league-edit-create/league-edit-create.component';
import {FormsModule} from '@angular/forms';
import {playerRouteGuard} from '../guards/player.route.guard';
import {AdminListComponent} from './admin-list/admin-list.component';
import {AdminSummaryComponent} from './admin-summary/admin-summary.component';
import {LeaguePlayerGraphComponent} from './league-player-graph/league-player-graph.component';

const leagueRoutes: Routes = [
    {path: 'leagues', component: LeagueBrowserComponent, canActivate: [playerRouteGuard]},
    {path: 'leagues/:name', component: LeagueProfileComponent, canActivate: [playerRouteGuard]},
    {path: 'leagues/:name/players', component: LeagueProfilePlayersComponent, canActivate: [playerRouteGuard]},
    {path: 'leagues/:name/teams', component: LeagueProfileTeamsComponent, canActivate: [playerRouteGuard]},
    {path: 'leagues/:name/edit', component: LeagueEditCreateComponent, canActivate: [playerRouteGuard]},
    {path: 'league-create', component: LeagueEditCreateComponent, canActivate: [playerRouteGuard]},
];

@NgModule({
    declarations: [
        LeagueSummaryComponent,
        LeagueBrowserComponent,
        LeagueListComponent,
        LeaguePlayerListComponent,
        LeagueTeamListComponent,
        LeagueProfileComponent,
        LeagueProfilePlayersComponent,
        LeagueProfileTeamsComponent,
        LeagueEditCreateComponent,
        LeaguePlayerGraphComponent,
        AdminListComponent,
        AdminSummaryComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        GamesModule,
        RouterModule.forChild(leagueRoutes)
    ],
    exports: [LeagueListComponent, LeaguePlayerListComponent, LeagueTeamListComponent],
    providers: [],
    bootstrap: []
})
export class LeaguesModule {
}
