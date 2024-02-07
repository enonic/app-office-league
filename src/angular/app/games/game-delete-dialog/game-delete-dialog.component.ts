import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'game-delete-dialog',
    templateUrl: 'game-delete-dialog.component.html'
})
export class GameDeleteDialogComponent {
    @Output() deleteConfirmed = new EventEmitter<void>();

    constructor() {}

    onConfirmDeleteClicked() {
        this.deleteConfirmed.emit();
    }
}
