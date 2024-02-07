import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'game-comment-modal',
    templateUrl: 'game-comment-dialog.component.html'
})
export class GameCommentDialogComponent {
    comment: string;

    @Output() commentSubmitted = new EventEmitter<string>();

    onCommentDoneClicked(): void {
        this.commentSubmitted.emit(this.comment);
    }
}
