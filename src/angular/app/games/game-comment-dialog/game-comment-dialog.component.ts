import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'game-comment-dialog',
    templateUrl: 'game-comment-dialog.component.html'
})
export class GameCommentDialogComponent {
    comment: string;

    @Output() commentSubmitted = new EventEmitter<string>();

    onCommentDoneClicked(): void {
        this.commentSubmitted.emit(this.comment);
    }
}
