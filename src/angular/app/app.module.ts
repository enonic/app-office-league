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
import {HomeComponent} from './home.component';
import {CommonModule} from './common/common.module';
import {MaterializeModule} from 'angular2-materialize/dist/index';

const appRoutes: Routes = [
    {path: '', component: HomeComponent},
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
    providers: [GraphQLService, AuthService, AuthRouteGuard],
    bootstrap: [AppComponent]
})
export class AppModule {
}