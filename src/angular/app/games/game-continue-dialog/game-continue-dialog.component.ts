import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'game-continue-dialog',
    templateUrl: 'game-continue-dialog.component.html'
})
export class GameContinueDialogComponent {
    @Output() continueConfirmed = new EventEmitter<void>();

    constructor() {}

    onConfirmContinueClicked() {
        this.continueConfirmed.emit();
    }
}
