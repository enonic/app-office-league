import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Player} from '../../../graphql/schemas/Player';

@Component({
    templateUrl: './player-select-dialog.component.html',
})
export class PlayerSelectDialogComponent {

    constructor(
        private dialogRef: MatDialogRef<PlayerSelectDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            possibleTeamMateIds: string[];
        }
    ) {}

    onPlayerSelected(player: Player) {
        // Close the dialog and return the selected players
        this.dialogRef.close(player);
    }
}
