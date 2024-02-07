import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'game-delete-dialog',
    templateUrl: 'game-delete-dialog.component.html',
    styleUrls: ['game-delete-dialog.component.less']
})
export class GameDeleteDialogComponent {
    @Output() deleteConfirmed = new EventEmitter<void>();

    constructor() {}

    onConfirmDeleteClicked() {
        this.deleteConfirmed.emit();
    }
}
