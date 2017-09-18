import {Component, Input, Output, OnChanges, AfterViewInit, SimpleChanges, SimpleChange, EventEmitter, ElementRef, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {MaterializeAction, MaterializeDirective} from 'angular2-materialize';
import {BaseComponent} from '../base.component';
declare var $: any;

@Component({
    selector: 'chips',
    templateUrl: 'chips.component.html',
    styleUrls: ['chips.component.less']
})
export class ChipsComponent extends BaseComponent implements AfterViewInit {

    @Input() availableTags: string[];
    @Input() excludedTags: string[] = [];
    @Input() selectedTags: string[] = [];
    @Input() placeholder: string;
    @ViewChild ('div') div;
    
    constructor(route: ActivatedRoute) {
        super(route);
    }
    
    ngOnInit() : void {
        super.ngOnInit();
    }

    ngAfterViewInit(): void {        
        this.refreshChips();
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);
        if (changes['availableTags'] || changes['selectedTags']) {
            this.refreshChips();
        }
    }

    focus() {
        if (this.div) {
            this.div.nativeElement.children[0].focus();
        }
    }
    
    refreshChips(): void {
        let autocompleteData = {};
        this.availableTags.filter((tag) => this.excludedTags.indexOf(tag) == -1 ).
            forEach((tag) => autocompleteData[tag] = null);
        $('.chips').material_chip({
            autocompleteOptions: {
                data: autocompleteData,
                limit: Infinity,
                minLength: 1
            },
            placeholder: this.placeholder,
            secondaryPlaceholder: this.placeholder
        });
        
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

    select(chip) {
    }
}
