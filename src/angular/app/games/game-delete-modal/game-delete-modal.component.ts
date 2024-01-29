import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'game-delete-modal',
    templateUrl: 'game-delete-modal.component.html',
    styleUrls: ['game-delete-modal.component.less']
})
export class GameDeleteModalComponent {
    @Output() deleteConfirmed = new EventEmitter<void>();

    constructor() {}

    onConfirmDeleteClicked() {
        this.deleteConfirmed.emit();
    }
}
