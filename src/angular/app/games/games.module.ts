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
import {PlayerRouteGuard} from '../guards/player.route.guard';
import {NgChartsModule} from 'ng2-charts';
import {GameFlowComponent} from './game-flow/game-flow.component';
import {GameSelection} from './GameSelection';
import {RatingPointsComponent} from './rating-points/rating-points.component';
//import {MomentModule} from 'angular2-moment'
//import { MaterializeModule } from 'angular2-materialize';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from "@angular/material/input";
import {PlayerSelectDialogComponent} from './player-select-dialog/player-select-dialog.component';
import {NgOptimizedImage} from '@angular/common';
import {GameCommentModalComponent} from './game-comment-modal/game-comment-modal.component';
import {GameDeleteModalComponent} from './game-delete-modal/game-delete-modal.component';
import {GameContinueModalComponent} from './game-continue-modal/game-continue-modal.component';

const gameRoutes: Routes = [
    {path: 'games', component: GameListPageComponent, canActivate: [PlayerRouteGuard]},
    {path: 'games/:id', component: GameProfileComponent, canActivate: [PlayerRouteGuard]},
    {path: 'games/:leagueId/new-game', component: NewGameComponent, canActivate: [PlayerRouteGuard]},
    {path: 'games/:leagueId/game-play', component: GamePlayComponent, canActivate: [PlayerRouteGuard]},
    {path: 'leagues/:leagueName/games', component: GameListPageComponent, canActivate: [PlayerRouteGuard,]},
    {path: 'players/:playerName/games', component: GameListPageComponent, canActivate: [PlayerRouteGuard,]},
    {path: 'teams/:teamName/games', component: GameListPageComponent, canActivate: [PlayerRouteGuard,]}
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
        RatingPointsComponent,
        PlayerSelectDialogComponent,
        GameCommentModalComponent,
        GameDeleteModalComponent,
        GameContinueModalComponent
    ],
    imports: [
        CommonModule,
        //MaterializeModule,
        RouterModule.forChild(gameRoutes),
        FormsModule,
        NgChartsModule,
        //MomentModule
        MatDialogModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        NgOptimizedImage
    ],
    exports: [GameListComponent],
    providers: [GameSelection],
    bootstrap: []
})
export class GamesModule {
}
