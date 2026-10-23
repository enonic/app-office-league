import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '../common/common.module';
import {TeamProfileComponent} from './team-profile/team-profile.component';
import {GamesModule} from '../games/games.module';
import {LeaguesModule} from '../leagues/league.module';
import {TeamEditCreateComponent} from './team-edit-create/team-edit-create.component';
import {TeamListPageComponent} from './team-list-page/team-list-page.component';
import {FormsModule} from '@angular/forms';
import {playerRouteGuard} from '../guards/player.route.guard';

const teamRoutes: Routes = [
    {path: 'teams', component: TeamListPageComponent, canActivate: [playerRouteGuard]},
    {path: 'teams/:name', component: TeamProfileComponent, canActivate: [playerRouteGuard]},
    {path: 'teams/:name/edit', component: TeamEditCreateComponent, canActivate: [playerRouteGuard]},
    {path: 'team-create', component: TeamEditCreateComponent, canActivate: [playerRouteGuard]},
];

@NgModule({
    declarations: [
        TeamListPageComponent,
        TeamProfileComponent,
        TeamEditCreateComponent
    ],
    imports: [
        CommonModule,
        GamesModule,
        LeaguesModule,
        RouterModule.forChild(teamRoutes),
        FormsModule
    ],
    exports: [],
    providers: [],
    bootstrap: []
})
export class TeamsModule {
}
