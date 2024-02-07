import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './remove-player-dialog.component.html'
})
export class RemovePlayerDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<RemovePlayerDialogComponent>,
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
