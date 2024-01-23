import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
    selector: 'app-chips',
    templateUrl: 'chips.component.html',
    styleUrls: ['chips.component.less']
})
export class ChipsComponent implements AfterViewInit {
    @Input() availableTags: string[];
    @Input() excludedTags: string[] = [];
    @Input() selectedTags: string[] = [];
    @Input() placeholder: string;
    @ViewChild('chipList') chipList: ElementRef;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor() {}

    ngAfterViewInit(): void {}

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our tag
        if ((value || '').trim()) {
            if (this.availableTags.includes(value.trim()) && !this.excludedTags.includes(value.trim())) {
                this.selectedTags.push(value.trim());
            }
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    delete(tag: string): void {
        const index = this.selectedTags.indexOf(tag);
        if (index >= 0) {
            this.selectedTags.splice(index, 1);
        }
    }
}
