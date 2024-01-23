import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {Player} from '../../../graphql/schemas/Player';
import { Config } from '../../app.config';
//import {MaterializeAction} from 'angular2-materialize';
import { MatDialog } from '@angular/material/dialog';
import {PlayerSelectDialogComponent} from '../player-select-dialog/player-select-dialog.component';

declare var XPCONFIG: Config;

@Component({
    selector: 'new-game-player',
    templateUrl: 'new-game-player.component.html',
    styleUrls: ['new-game-player.component.less']
})
export class NewGamePlayerComponent {
    @Input() player: Player;
    @Input() leaguePlayerIds: string[];
    @Input() selectedPlayerIds: string[];
    @Input() sideClass: string;
    @Output() playerSelected: EventEmitter<Player> = new EventEmitter<Player>();

    playerSelectEnabled: boolean;

    constructor(private dialog: MatDialog) {}

    onNewPlayerClicked() {
        this.showModal();
    }

    public showModal(): void {
        const dialogRef = this.dialog.open(PlayerSelectDialogComponent, {
            width: '250px',
            data: {
                leaguePlayerIds: this.leaguePlayerIds,
                selectedPlayerIds: this.selectedPlayerIds
            }
        });

        dialogRef.afterClosed().subscribe(player => {
            this.playerSelectEnabled = false;
            this.playerSelected.emit(player);
        });

        this.playerSelectEnabled = true;
    }

    questionMarkImg(): string {
        return `${XPCONFIG.assetsUrl}/img/questionmark.svg`;
    }
}
