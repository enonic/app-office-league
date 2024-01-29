import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'game-continue-modal',
    templateUrl: 'game-continue-modal.component.html'
})
export class GameContinueModalComponent {
    @Output() continueConfirmed = new EventEmitter<void>();

    constructor() {}

    onConfirmContinueClicked() {
        this.continueConfirmed.emit();
    }
}
