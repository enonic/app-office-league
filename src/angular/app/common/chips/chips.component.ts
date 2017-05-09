import {Component, Input, Output, OnChanges, SimpleChanges, SimpleChange, EventEmitter, ElementRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {MaterializeAction, MaterializeDirective} from 'angular2-materialize';
import {BaseComponent} from '../base.component';
declare var $: any;

@Component({
    selector: 'chips',
    templateUrl: 'chips.component.html',
    styleUrls: ['chips.component.less']
})
export class ChipsComponent extends BaseComponent {

    @Input() availableTags: string[];
    @Input() selectedTags: string[];
    @Input() placeholder: string;
    public autocompleteInit: any = {
        autocompleteOptions: {
            data: {
            },
            limit: Infinity,
            minLength: 1
        },
        placeholder: this.placeholder,
        secondaryPlaceholder: this.placeholder
    };
    
    constructor(route: ActivatedRoute) {
        super(route);
    }
    
    ngOnInit() : void {
        super.ngOnInit();
        this.refreshAvailableTags();
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        let availableTagsChange = changes['availableTags'];
        if (availableTagsChange) {
            this.refreshAvailableTags();
        }
    }
    
    refreshAvailableTags(): void {
        let data = {};
        this.availableTags.forEach((tag) => data[tag] = null);
        this.autocompleteInit = {
            autocompleteOptions: {
                data: data,
                limit: Infinity,
                minLength: 1
            },
            placeholder: this.placeholder,
            secondaryPlaceholder: this.placeholder
        };
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
