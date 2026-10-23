import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GameComponent} from './game/game.component';
import {GameListComponent} from './game-list/game-list.component';
import {GameListPageComponent} from './game-list-page/game-list-page.component';
import {CommonModule} from '../common/common.module';
import {GameProfileComponent} from './game-profile/game-profile.component';
import {NewGameComponent} from './new-game/new-game.component';
import {NewGamePlayerComponent} from './new-game-player/new-game-player.component';
import {FormsModule} from '@angular/forms';
import {GamePlayComponent} from './game-play/game-play.component';
import {GamePointsComponent} from './game-points/game-points.component';
import {playerRouteGuard} from '../guards/player.route.guard';
import {GameFlowComponent} from './game-flow/game-flow.component';
import {GameSelection} from './GameSelection';
import {RatingPointsComponent} from './rating-points/rating-points.component';

const gameRoutes: Routes = [
    {path: 'games', component: GameListPageComponent, canActivate: [playerRouteGuard]},
    {path: 'games/:id', component: GameProfileComponent, canActivate: [playerRouteGuard]},
    {path: 'games/:leagueId/new-game', component: NewGameComponent, canActivate: [playerRouteGuard]},
    {path: 'games/:leagueId/game-play', component: GamePlayComponent, canActivate: [playerRouteGuard]},
    {path: 'leagues/:leagueName/games', component: GameListPageComponent, canActivate: [playerRouteGuard]},
    {path: 'players/:playerName/games', component: GameListPageComponent, canActivate: [playerRouteGuard]},
    {path: 'teams/:teamName/games', component: GameListPageComponent, canActivate: [playerRouteGuard]}
];

@NgModule({
    declarations: [
        GameListComponent,
        GameListPageComponent,
        GameProfileComponent,
        GameComponent,
        NewGameComponent,
        NewGamePlayerComponent,
        GamePlayComponent,
        GamePointsComponent,
        GameFlowComponent,
        RatingPointsComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(gameRoutes),
        FormsModule
    ],
    exports: [GameListComponent],
    providers: [GameSelection],
    bootstrap: []
})
export class GamesModule {
}
