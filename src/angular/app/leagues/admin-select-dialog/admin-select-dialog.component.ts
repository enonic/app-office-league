import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Player } from '../../../graphql/schemas/Player'; // Adjust the path as needed

@Component({
    selector: 'app-admin-select-dialog',
    templateUrl: './admin-select-dialog.component.html',
})
export class AdminSelectDialogComponent {
    constructor(
        private dialogRef: MatDialogRef<AdminSelectDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    onAdminSelected(player: Player) {
        // Close the dialog and return the selected player
        this.dialogRef.close(player);
    }
}
