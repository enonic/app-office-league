import {Component, Input, Output, OnChanges, SimpleChanges, SimpleChange, EventEmitter, ElementRef} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {MaterializeAction, MaterializeDirective} from 'angular2-materialize';
import {BaseComponent} from '../base.component';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../services/graphql.service';
declare var $: any;

@Component({
    selector: 'players-select',
    templateUrl: 'players-select.component.html',
    styleUrls: ['players-select.component.less']
})
export class PlayersSelectComponent extends BaseComponent {

    @Input() playerNames: string[];
    private autocompleteInit: any = {
        autocompleteOptions: {
            data: {
                'Apple': null,
                'Microsoft': null,
                'Google': null
            },
            limit: Infinity,
            minLength: 1
        }
    };
    
    constructor(route: ActivatedRoute) {
        super(route);
    }
    
    ngOnInit() : void {
        let data = {};
        this.playerNames.forEach((playerName) => data[playerName] = null);
        console.log('data', data);
        this.autocompleteInit = {
            autocompleteOptions: {
                data: data,
                limit: Infinity,
                minLength: 1
            }
        };
    }

    add(chip) {
        console.log("Chip added: " + chip.tag);
    }

    delete(chip) {
        console.log("Chip deleted: " + chip.tag);
    }

    select(chip) {
        console.log("Chip selected: " + chip.tag);
    }
}
