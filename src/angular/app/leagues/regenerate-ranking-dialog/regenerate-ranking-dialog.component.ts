import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './regenerate-ranking-dialog.component.html'
})
export class RegenerateRankingDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<RegenerateRankingDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { leagueName: string }
    ) {}

    onConfirmRegenerate(): void {
        this.dialogRef.close(true);
    }

    onCancelRegenerate(): void {
        this.dialogRef.close(false);
    }
}
