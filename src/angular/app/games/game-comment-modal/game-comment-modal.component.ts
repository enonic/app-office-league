import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'game-comment-modal',
    templateUrl: 'game-comment-modal.component.html'
})
export class GameCommentModalComponent {
    comment: string;

    @Output() commentSubmitted = new EventEmitter<string>();

    onCommentDoneClicked(): void {
        this.commentSubmitted.emit(this.comment);
    }
}
