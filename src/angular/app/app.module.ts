import {ErrorHandler, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';
import {PlayersModule} from './players/players.module';
import {GraphQLService} from './services/graphql.service';
import {GamesModule} from './games/games.module';
import {TeamsModule} from './teams/team.module';
import {LeaguesModule} from './leagues/league.module';
import {InfoPageModule} from './info-page/info-page.module';
import {AuthenticatedRouteGuard} from './guards/authenticated.route.guard';
import {PlayerRouteGuard} from './guards/player.route.guard';
import {EditRouteGuard} from './guards/edit.route.guard';
import {AuthService} from './services/auth.service';
import {CryptoService} from './services/crypto.service';
import {CommonModule} from './common/common.module';
import {MaterializeModule} from 'angular2-materialize';
import {PageTitleService} from './services/page-title.service';
import {OfflinePersistenceService} from './services/offline-persistence.service';
import {OnlineStatusService} from './services/online-status.service';
import {RankingService} from './services/ranking.service';
import {GlobalErrorHandler} from './common/global.errorhandler';
import {UserProfileService} from './services/user-profile.service';
import {WindowRefService} from './services/window-ref.service';
import {AudioService} from './services/audio.service';
import {PushNotificationService} from './services/push-notification.sevice';

const appRoutes: Routes = [
    {path: '**', redirectTo: '', pathMatch: 'full'}
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        CommonModule,
        MaterializeModule,
        RouterModule.forRoot(appRoutes),
        FormsModule,
        HttpModule,
        PlayersModule,
        GamesModule,
        TeamsModule,
        LeaguesModule,
        InfoPageModule
    ],
    providers: [GraphQLService, AuthService, CryptoService, PageTitleService, AuthenticatedRouteGuard, PlayerRouteGuard, EditRouteGuard,
        OfflinePersistenceService, OnlineStatusService, RankingService, UserProfileService, WindowRefService, AudioService,
        PushNotificationService,
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}