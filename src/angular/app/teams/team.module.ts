import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '../common/common.module';
import {TeamProfileComponent} from './team-profile/team-profile.component';
import {GamesModule} from '../games/games.module';
import {TeamListComponent} from '../common/team-list/team-list.component';

const teamRoutes: Routes = [
    {path: 'teams', component: TeamListComponent, data: {}},
    {path: 'teams/:name', component: TeamProfileComponent, data: {}},
];

@NgModule({
    declarations: [
        TeamProfileComponent
    ],
    imports: [
        CommonModule,
        GamesModule,
        RouterModule.forChild(teamRoutes)
    ],
    exports: [],
    providers: [],
    bootstrap: []
})
export class TeamsModule {
}
