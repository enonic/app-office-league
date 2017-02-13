import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TeamListComponent} from './team-list/team-list.component';
import {CommonModule} from '../common/common.module';
import {TeamProfileComponent} from './team-profile/team-profile.component';
import {TeamComponent} from './team/team.component';

const teamRoutes: Routes = [
    {path: 'teams', component: TeamListComponent, data: {autoLoad: true}},
    {path: 'teams/:id', component: TeamProfileComponent, data: {autoLoad: true}},
];

@NgModule({
    declarations: [
        TeamComponent,
        TeamListComponent,
        TeamProfileComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(teamRoutes)
    ],
    exports: [TeamListComponent],
    providers: [],
    bootstrap: []
})
export class TeamsModule {
}
