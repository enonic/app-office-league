import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AppComponent} from './app.component';
import {Routes, RouterModule} from '@angular/router';
import {PlayersModule} from './players/players.module';
import {GraphQLService} from './graphql.service';
import {GamesModule} from './games/games.module';
import {TeamsModule} from './teams/team.module';
import {LeaguesModule} from './leagues/league.module';
import {AuthRouteGuard} from './auth.route.guard';
import {AuthService} from './auth.service';

const appRoutes: Routes = [
    {path: '', redirectTo: 'games', pathMatch: 'full'}
];

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        RouterModule.forRoot(appRoutes),
        FormsModule,
        HttpModule,
        PlayersModule,
        GamesModule,
        TeamsModule,
        LeaguesModule
    ],
    providers: [GraphQLService, AuthService, AuthRouteGuard],
    bootstrap: [AppComponent]
})
export class AppModule {
}