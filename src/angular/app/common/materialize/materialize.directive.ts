import {AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';

export interface MaterializeAction {
    action: string;
    params?: any[];
}

export function toast(html: string, displayLength: number = 3000, classes?: string): void {
    M.toast({html: html, displayLength: displayLength, classes: classes});
}

/**
 * Minimal replacement for angular2-materialize: <div materialize="modal" [materializeParams]="[options]" [materializeActions]="emitter">
 * Actions: {action: 'modal', params: ['open' | 'close']}
 */
@Directive({
    selector: '[materialize]'
})
export class MaterializeDirective implements AfterViewInit, OnDestroy {

    @Input() materialize: string;
    @Input() materializeParams: any[];
    @Input() materializeActions: EventEmitter<string | MaterializeAction>;

    private modal: M.Modal;
    private subscription: Subscription;

    constructor(private el: ElementRef) {
    }

    ngAfterViewInit(): void {
        if (this.materialize !== 'modal') {
            console.warn('[materialize] unsupported component: ' + this.materialize);
            return;
        }
        const options = (this.materializeParams && this.materializeParams[0]) || {};
        this.modal = M.Modal.init(this.el.nativeElement, options);
        if (this.materializeActions) {
            this.subscription = this.materializeActions.subscribe((action: string | MaterializeAction) => this.perform(action));
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.modal) {
            this.modal.destroy();
            this.modal = null;
        }
    }

    private perform(action: string | MaterializeAction): void {
        const command = typeof action === 'string' ? action : action.params && action.params[0];
        if (command === 'open') {
            this.modal.open();
        } else if (command === 'close') {
            this.modal.close();
        }
    }
}
