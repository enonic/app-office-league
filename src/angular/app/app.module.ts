import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {Routes, RouterModule} from '@angular/router';
import {PlayersModule} from './players/players.module';
import {GraphQLService} from './services/graphql.service';
import {GamesModule} from './games/games.module';
import {TeamsModule} from './teams/team.module';
import {LeaguesModule} from './leagues/league.module';
import {AuthenticatedRouteGuard} from './guards/authenticated.route.guard';
import {PlayerRouteGuard} from './guards/player.route.guard';
import {AuthService} from './services/auth.service';
import {CryptoService} from './services/crypto.service';
import {HomeComponent} from './home.component';
import {CommonModule} from './common/common.module';
import {MaterializeModule} from 'angular2-materialize';
import {PageTitleService} from './services/page-title.service';

const appRoutes: Routes = [
    {path: '**', redirectTo: '', pathMatch: 'full'}
];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent
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
        LeaguesModule
    ],
    providers: [GraphQLService, AuthService, CryptoService, PageTitleService, AuthenticatedRouteGuard, PlayerRouteGuard],
    bootstrap: [AppComponent]
})
export class AppModule {
}