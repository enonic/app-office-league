import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './add-player-modal.component.html',
})
export class AddPlayerModalComponent {
    constructor(
        public dialogRef: MatDialogRef<AddPlayerModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            playerNamesToAdd: string[];
            nonMembersPlayerNames: string[];
        }
    ) {}

    onPlayersAdded(): void {
        this.dialogRef.close(this.data.playerNamesToAdd);
    }
}
