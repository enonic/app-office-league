import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '../common/common.module';
import {TeamProfileComponent} from './team-profile/team-profile.component';
import {GamesModule} from '../games/games.module';
import {LeaguesModule} from '../leagues/league.module';
import {TeamEditComponent} from './team-edit/team-edit.component';
import {TeamListPageComponent} from './team-list-page/team-list-page.component';
import {FormsModule} from '@angular/forms';

const teamRoutes: Routes = [
    {path: 'teams', component: TeamListPageComponent, data: {}},
    {path: 'teams/:name', component: TeamProfileComponent, data: {}},
    {path: 'teams/:name/edit', component: TeamEditComponent, data: {}},
];

@NgModule({
    declarations: [
        TeamListPageComponent,
        TeamProfileComponent,
        TeamEditComponent
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
