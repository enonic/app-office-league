import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './remove-player-modal.component.html',
    styleUrls: ['./remove-player-modal.component.css']
})
export class RemovePlayerModalComponent {
    constructor(
        public dialogRef: MatDialogRef<RemovePlayerModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            playerName: string,
            leagueName: string
        } // Add types as appropriate
    ) {}

    onConfirmRemoveClicked(): void {
        // Implement your removal logic here
        this.dialogRef.close(true); // Close the dialog and optionally return data
    }
}
