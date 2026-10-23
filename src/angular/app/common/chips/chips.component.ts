import {ChangeDetectionStrategy, Component, Input, AfterViewInit, SimpleChanges, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../base.component';

@Component({
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'chips',
    templateUrl: 'chips.component.html',
    styleUrls: ['chips.component.less']
})
export class ChipsComponent extends BaseComponent implements AfterViewInit {

    @Input() availableTags: string[];
    @Input() excludedTags: string[] = [];
    @Input() selectedTags: string[] = [];
    @Input() placeholder: string;
    @ViewChild('div') div: ElementRef<HTMLDivElement>;

    constructor(route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
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
            (this.div.nativeElement.children[0] as HTMLElement).focus();
        }
    }

    refreshChips(): void {
        if (!this.div) {
            return;
        }
        let autocompleteData = {};
        this.availableTags.filter((tag) => this.excludedTags.indexOf(tag) == -1).
            forEach((tag) => autocompleteData[tag] = null);

        // materialize-css 1.0 reports changes through callbacks, not DOM events
        const chips = M.Chips.init(this.div.nativeElement, {
            data: this.selectedTags.map((tag) => ({tag: tag})),
            autocompleteOptions: {
                data: autocompleteData,
                limit: Infinity,
                minLength: 1
            },
            placeholder: this.placeholder,
            secondaryPlaceholder: this.placeholder,
            onChipAdd: () => this.syncSelectedTags(chips),
            onChipDelete: () => this.syncSelectedTags(chips)
        });
    }

    // keep the same array instance: parents hold a reference to it
    private syncSelectedTags(chips: M.Chips): void {
        const tags = chips.chipsData.map((chip) => chip.tag);
        this.selectedTags.splice(0, this.selectedTags.length, ...tags);
    }
}
