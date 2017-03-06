import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '../common/common.module';
import {LeagueSummaryComponent} from './league-summary/league-summary.component';
import {LeagueBrowserComponent} from './league-browser/league-browser.component';
import {LeagueListComponent} from './league-list/league-list.component';
import {LeaguePlayerListComponent} from './league-player-list/league-player-list.component';
import {LeagueTeamListComponent} from './league-team-list/league-team-list.component';
import {GamesModule} from '../games/games.module';
import {TeamsModule} from '../teams/team.module';
import {LeagueProfileComponent} from './league-profile/league-profile.component';
import {LeagueProfilePlayersComponent} from './league-profile-players/league-profile-players.component';
import {LeagueProfileTeamsComponent} from './league-profile-teams/league-profile-teams.component';
import {LeagueCreateComponent} from './league-create/league-create.component';
import {FormsModule} from '@angular/forms';
import {MaterializeModule} from 'angular2-materialize/dist/index';

const leagueRoutes: Routes = [
    {path: 'leagues', component: LeagueBrowserComponent, data: {}},
    {path: 'leagues/:name', component: LeagueProfileComponent, data: {}},
    {path: 'leagues/:name/players', component: LeagueProfilePlayersComponent, data: {}},
    {path: 'leagues/:name/teams', component: LeagueProfileTeamsComponent, data: {}},
    {path: 'league-create', component: LeagueCreateComponent, data: {}},
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
        LeagueCreateComponent
    ],
    imports: [
        MaterializeModule,
        FormsModule,
        CommonModule,
        GamesModule,
        RouterModule.forChild(leagueRoutes)
    ],
    exports: [LeagueListComponent, LeaguePlayerListComponent,LeagueTeamListComponent],
    providers: [],
    bootstrap: []
})
export class LeaguesModule {
}
