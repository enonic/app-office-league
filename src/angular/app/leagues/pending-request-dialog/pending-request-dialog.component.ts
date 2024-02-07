import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    templateUrl: './pending-request-dialog.component.html'
})
export class PendingRequestDialogComponent {
    constructor(public dialogRef: MatDialogRef<PendingRequestDialogComponent>) {}

    closeDialog(): void {
        this.dialogRef.close();
    }
}
