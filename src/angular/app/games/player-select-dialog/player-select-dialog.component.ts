import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Player} from '../../../graphql/schemas/Player';

@Component({
    selector: 'app-player-select-dialog',
    templateUrl: 'player-select-dialog.component.html',
})
export class PlayerSelectDialogComponent {
    constructor(
        private dialogRef: MatDialogRef<PlayerSelectDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    onPlayerSelected(player: any) {
        this.dialogRef.close(player);
    }
}
