import {Component, Inject, ViewChild} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface AddPlayersDialogData {
    playerNamesToAdd: string[];
    nonMembersPlayerNames: string[];
}

@Component({
    templateUrl: './add-players-dialog.component.html',
})

export class AddPlayersDialogComponent {
    @ViewChild('addPlayerChips') addPlayerChipsViewChild: any;

    constructor(
        public dialogRef: MatDialogRef<AddPlayersDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AddPlayersDialogData
    ) {}

    onPlayersAdded(): void {
        this.dialogRef.close(this.data.playerNamesToAdd);
    }
}
