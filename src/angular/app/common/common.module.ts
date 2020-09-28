import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ListComponent } from './list.component';
import { List2Component } from './list2.component';
import { BaseComponent } from './base.component';
import { GameSummaryComponent } from './game-summary/game-summary.component';
import { PlayerSummaryComponent } from './player-summary/player-summary.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { TeamSummaryComponent } from './team-summary/team-summary.component';
import { TeamListComponent } from './team-list/team-list.component';
import { TeamPlayersComponent } from './team-players/team-players.component';
import { LoadingComponent } from './loading/loading.component';
import { PlayerSelectComponent } from './player-select/player-select.component';
//import { ChipsComponent } from './chips/chips.component';
import { ReactiveFormsModule } from "@angular/forms";
import { ConnectionErrorComponent } from './connection-error/connection-error.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


@NgModule({
    declarations: [
        GameSummaryComponent,
        PlayerSummaryComponent,
        PlayerListComponent,
        TeamSummaryComponent,
        TeamListComponent,
        TeamPlayersComponent,
        BaseComponent,
        ListComponent,
        List2Component,
        LoadingComponent,
        ConnectionErrorComponent,
        PlayerSelectComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        MatSidenavModule,
        MatChipsModule,
        MatFormFieldModule,
        MatAutocompleteModule,
    ],
    exports: [
        BrowserModule,
        ReactiveFormsModule,
        GameSummaryComponent,
        PlayerSummaryComponent,
        PlayerListComponent,
        TeamSummaryComponent,
        TeamListComponent,
        TeamPlayersComponent,
        BaseComponent,
        ListComponent,
        List2Component,
        LoadingComponent,
        ConnectionErrorComponent,
        PlayerSelectComponent,
    ]
})
export class CommonModule {
}
