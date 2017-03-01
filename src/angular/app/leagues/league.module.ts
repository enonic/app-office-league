import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '../common/common.module';
import {LeagueSummaryComponent} from './league-summary/league-summary.component';
import {LeagueBrowserComponent} from './league-browser/league-browser.component';
import {LeagueListComponent} from './league-list/league-list.component';
import {LeaguePlayerListComponent} from './league-player-list/league-player-list.component';
import {GamesModule} from '../games/games.module';
import {TeamsModule} from '../teams/team.module';
import {LeagueProfileComponent} from './league-profile/league-profile.component';
import {LeagueProfilePlayersComponent} from './league-profile-players/league-profile-players.component';
import {LeagueCreateComponent} from './league-create/league-create.component';
import {FormsModule} from '@angular/forms';

const leagueRoutes: Routes = [
    {path: 'leagues', component: LeagueBrowserComponent, data: {autoLoad: true}},
    {path: 'leagues/:name', component: LeagueProfileComponent, data: {autoLoad: true}},
    {path: 'leagues/:name/players', component: LeagueProfilePlayersComponent, data: {autoLoad: true}},
    {path: 'league-create', component: LeagueCreateComponent, data: {autoLoad: true}},
];

@NgModule({
    declarations: [
        LeagueSummaryComponent,
        LeagueBrowserComponent,
        LeagueListComponent,
        LeaguePlayerListComponent,
        LeagueProfileComponent,
        LeagueProfilePlayersComponent,
        LeagueCreateComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        GamesModule,
        TeamsModule,
        RouterModule.forChild(leagueRoutes)
    ],
    exports: [LeagueListComponent, LeaguePlayerListComponent],
    providers: [],
    bootstrap: []
})
export class LeaguesModule {
}
