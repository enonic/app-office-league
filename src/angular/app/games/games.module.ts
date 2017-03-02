import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GameComponent} from './game/game.component';
import {GameListComponent} from './game-list/game-list.component';
import {CommonModule} from '../common/common.module';
import {GameProfileComponent} from './game-profile/game-profile.component';
import {NewGameComponent} from './new-game/new-game.component';
import {NewGamePlayerComponent} from './new-game-player/new-game-player.component';
import {PlayerSelectComponent} from './player-select/player-select.component';

const gameRoutes: Routes = [
    {
        path: 'games',
        component: GameListComponent,
        data: {autoLoad: true}
    },
    {
        path: 'games/:id',
        component: GameProfileComponent,
        // canActivate: [AuthRouteGuard],
        data: {autoLoad: true}
    },
    {
        path: 'games/:leagueId/new-game',
        component: NewGameComponent,
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
        PlayerSelectComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(gameRoutes)
    ],
    exports: [GameListComponent],
    providers: [],
    bootstrap: []
})
export class GamesModule {
}
