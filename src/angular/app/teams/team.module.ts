import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '../common/common.module';
import {TeamProfileComponent} from './team-profile/team-profile.component';
import {GamesModule} from '../games/games.module';
import {LeaguesModule} from '../leagues/league.module';
import {TeamEditCreateComponent} from './team-edit-create/team-edit-create.component';
import {TeamListPageComponent} from './team-list-page/team-list-page.component';
import {FormsModule} from '@angular/forms';
import {PlayerRouteGuard, } from '../guards/player.route.guard';
import {PlayerSelectDialogComponent} from './player-select-dialog/player-select-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';

const teamRoutes: Routes = [
    {path: 'teams', component: TeamListPageComponent, canActivate: [PlayerRouteGuard,]},
    {path: 'teams/:name', component: TeamProfileComponent, canActivate: [PlayerRouteGuard,]},
    {path: 'teams/:name/edit', component: TeamEditCreateComponent, canActivate: [PlayerRouteGuard,]},
    {path: 'team-create', component: TeamEditCreateComponent, canActivate: [PlayerRouteGuard,]},
];

@NgModule({
    declarations: [
        TeamListPageComponent,
        TeamProfileComponent,
        TeamEditCreateComponent,
        PlayerSelectDialogComponent
    ],
    imports: [
        CommonModule,
        GamesModule,
        LeaguesModule,
        RouterModule.forChild(teamRoutes),
        FormsModule,
        MatDialogModule
    ],
    exports: [],
    providers: [],
    bootstrap: []
})
export class TeamsModule {
}
