import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GameComponent} from './game/game.component';
import {GameListComponent} from './game-list/game-list.component';
import {CommonModule} from '../common/common.module';
import {GameProfileComponent} from './game-profile/game-profile.component';
import {NewGameComponent} from './new-game/new-game.component';
import {NewGamePlayerComponent} from './new-game-player/new-game-player.component';
import {PlayerSelectComponent} from './player-select/player-select.component';
import {MaterializeModule} from 'angular2-materialize/dist/index';
import {GamePlayComponent} from './game-play/game-play.component';

const gameRoutes: Routes = [
    {
        path: 'games',
        component: GameListComponent,
        data: {}
    },
    {
        path: 'games/:id',
        component: GameProfileComponent,
        // canActivate: [AuthRouteGuard],
        data: {}
    },
    {
        path: 'games/:leagueId/new-game',
        component: NewGameComponent,
        data: {}
    },
    {
        path: 'games/:leagueId/game-play',
        component: GamePlayComponent,
        data: {}
    },
];

@NgModule({
    declarations: [
        GameListComponent,
        GameProfileComponent,
        GameComponent,
        NewGameComponent,
        NewGamePlayerComponent,
        PlayerSelectComponent,
        GamePlayComponent
    ],
    imports: [
        CommonModule,
        MaterializeModule,
        RouterModule.forChild(gameRoutes)
    ],
    exports: [GameListComponent],
    providers: [],
    bootstrap: []
})
export class GamesModule {
}
