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
import {NgChartsModule} from 'ng2-charts';
import {PlayerRouteGuard} from '../guards/player.route.guard';
import {AdminListComponent} from './admin-list/admin-list.component';
import {AdminSummaryComponent} from './admin-summary/admin-summary.component';
import {LeaguePlayerGraphComponent} from './league-player-graph/league-player-graph.component';
import {AdminSelectDialogComponent} from './admin-select-dialog/admin-select-dialog.component';
import {PlayerSelectDialogComponent} from './player-select-dialog/player-select-dialog.component';
// import { MaterializeModule } from 'angular2-materialize';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { AddPlayersDialogComponent } from './add-players-dialog/add-players-dialog.component';
import { RemovePlayerDialogComponent } from './remove-player-dialog/remove-player-dialog.component';
import { ChipsComponent } from '../common/chips/chips.component';
import {JoinLeagueRequestDialogComponent} from './join-league-request-dialog/join-league-request-dialog.component';
import {PendingRequestDialogComponent} from './pending-request-dialog/pending-request-dialog.component';

const leagueRoutes: Routes = [
    {path: 'leagues', component: LeagueBrowserComponent, canActivate: [PlayerRouteGuard,]},
    {path: 'leagues/:name', component: LeagueProfileComponent, canActivate: [PlayerRouteGuard,]},
    {path: 'leagues/:name/players', component: LeagueProfilePlayersComponent, canActivate: [PlayerRouteGuard,]},
    {path: 'leagues/:name/teams', component: LeagueProfileTeamsComponent, canActivate: [PlayerRouteGuard,]},
    {path: 'leagues/:name/edit', component: LeagueEditCreateComponent, canActivate: [PlayerRouteGuard,]},
    {path: 'league-create', component: LeagueEditCreateComponent, canActivate: [PlayerRouteGuard,]},
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
        AdminSummaryComponent,
        AdminSelectDialogComponent,
        PlayerSelectDialogComponent,
        AddPlayersDialogComponent,
        RemovePlayerDialogComponent,
        JoinLeagueRequestDialogComponent,
        PendingRequestDialogComponent
    ],
    imports: [
        //MaterializeModule,
        FormsModule,
        CommonModule,
        GamesModule,
        NgChartsModule,
        RouterModule.forChild(leagueRoutes),
        MatButtonModule,
        MatTabsModule,
        MatIconModule,
        MatDialogModule
    ],
    exports: [
        LeagueListComponent,
        LeaguePlayerListComponent,
        LeagueTeamListComponent,
        ChipsComponent
    ],
    providers: [],
    bootstrap: []
})
export class LeaguesModule {
}
