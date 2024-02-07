import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './league-leave-dialog.component.html'
})
export class LeagueLeaveDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<LeagueLeaveDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { leagueName: string }
    ) {}

    onConfirmLeave(): void {
        this.dialogRef.close(true);
    }

    onCancelLeave(): void {
        this.dialogRef.close(false);
    }
}
