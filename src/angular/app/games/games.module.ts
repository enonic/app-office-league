import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GameComponent} from './game/game.component';
import {GameListComponent} from './game-list/game-list.component';
import {CommonModule} from '../common/common.module';
import {GameProfileComponent} from './game-profile/game-profile.component';
import {NewGameComponent} from './new-game/new-game.component';
import {NewGamePlayerComponent} from './new-game-player/new-game-player.component';
import {MaterializeModule} from 'angular2-materialize/dist/index';
import {FormsModule} from '@angular/forms';
import {GamePlayComponent} from './game-play/game-play.component';
import {GamePointsComponent} from './game-points/game-points.component';
import {AuthRouteGuard} from '../auth.route.guard';
import {ChartsModule} from 'ng2-charts';
import {GameFlowComponent} from './game-flow/game-flow.component';


const gameRoutes: Routes = [
    {
        path: 'games',
        component: GameListComponent,
        canActivate: [AuthRouteGuard]
    },
    {
        path: 'games/:id',
        component: GameProfileComponent,
        canActivate: [AuthRouteGuard]
    },
    {
        path: 'games/:leagueId/new-game',
        component: NewGameComponent,
        canActivate: [AuthRouteGuard]
    },
    {
        path: 'games/:leagueId/game-play',
        component: GamePlayComponent,
        canActivate: [AuthRouteGuard]
    },
];

@NgModule({
    declarations: [
        GameListComponent,
        GameProfileComponent,
        GameComponent,
        NewGameComponent,
        NewGamePlayerComponent,
        GamePlayComponent,
        GamePointsComponent,
        GameFlowComponent
    ],
    imports: [
        CommonModule,
        MaterializeModule,
        RouterModule.forChild(gameRoutes),
        FormsModule,
        ChartsModule
    ],
    exports: [GameListComponent],
    providers: [],
    bootstrap: []
})
export class GamesModule {
}
