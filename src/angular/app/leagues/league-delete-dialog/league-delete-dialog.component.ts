import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './league-delete-dialog.component.html'
})
export class LeagueDeleteDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<LeagueDeleteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { leagueName: string }
    ) {}

    onConfirmDelete(): void {
        this.dialogRef.close(true); // Close the dialog and indicate deletion
    }

    onCancelDelete(): void {
        this.dialogRef.close(false); // Close the dialog without deletion
    }
}
