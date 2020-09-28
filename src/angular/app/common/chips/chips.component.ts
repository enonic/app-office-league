import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { Component, Input, Output, OnChanges, AfterViewInit, SimpleChanges, SimpleChange, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { BaseComponent } from '../base.component';

declare var $: any;

@Component({
    selector: 'chips',
    templateUrl: 'chips.component.html',
    styleUrls: ['chips.component.less']
})
export class ChipsComponent extends BaseComponent {
    visible = true;

    availableTags: string[];
    excludedTags: string[] = [];
    selectedTags: string[] = [];
    placeholder: string;
    tagCtrl = new FormControl();


    @ViewChild('tagInput') fruitInput: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;


    constructor(route: ActivatedRoute) {
        super(route);
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        if (changes['availableTags'] || changes['selectedTags']) {
            this.updateState();
        }
    }

    updateState(): void {
        let autocompleteData = {};
        this.availableTags.filter((tag) => this.excludedTags.indexOf(tag) == -1).
            forEach((tag) => autocompleteData[tag] = null);

        this.placeholder = this.placeholder;
        //this.secondaryPlaceholder = this.placeholder;

    }

    add(chip) {
        this.selectedTags.push(chip.tag);
    }

    delete(chip) {
        let deleteIndex = this.selectedTags.indexOf(chip.tag);
        if (deleteIndex > -1) {
            this.selectedTags.splice(deleteIndex, 1);
        }
    }

    selected(chip) {
    }
}
