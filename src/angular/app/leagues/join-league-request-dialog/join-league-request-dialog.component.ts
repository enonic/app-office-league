import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface JoinLeagueRequestDialogData {
    playerName: string;
    leagueName: string;
}

@Component({
    templateUrl: './join-league-request-dialog.component.html'
})
export class JoinLeagueRequestDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<JoinLeagueRequestDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: JoinLeagueRequestDialogData
    ) {}

    onConfirmJoin(allow: boolean): void {
        this.dialogRef.close(allow);
    }
}
