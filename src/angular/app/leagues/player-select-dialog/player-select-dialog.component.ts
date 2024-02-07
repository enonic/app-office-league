import {Component, Inject, ViewChild} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-player-select-dialog',
    templateUrl: './player-select-dialog.component.html',
})
export class PlayerSelectDialogComponent {
    @ViewChild('addPlayerChips') addPlayerChipsViewChild: any;
    onlyPlayerNamesToAdd: string[] = [];

    constructor(
        private dialogRef: MatDialogRef<PlayerSelectDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            allPlayerNames: string[];
            playerNames: string[];
        }
    ) {}

    onPlayersSelected() {
        // Close the dialog and return the selected players
        this.dialogRef.close(this.onlyPlayerNamesToAdd);
    }
}
