import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CommonModule} from '../common/common.module';
import {LeagueComponent} from './league/league.component';
import {LeagueListComponent} from './league-list/league-list.component';
import {GamesModule} from '../games/games.module';
import {TeamsModule} from '../teams/team.module';
import {LeagueProfileComponent} from './league-profile/league-profile.component';

const leagueRoutes: Routes = [
    {path: 'leagues', component: LeagueListComponent, data: {autoLoad: true}},
    {path: 'leagues/:id', component: LeagueProfileComponent, data: {autoLoad: true}},
];

@NgModule({
    declarations: [
        LeagueComponent,
        LeagueProfileComponent,
        LeagueListComponent
    ],
    imports: [
        CommonModule,
        GamesModule,
        TeamsModule,
        RouterModule.forChild(leagueRoutes)
    ],
    exports: [],
    providers: [],
    bootstrap: []
})
export class LeaguesModule {
}
