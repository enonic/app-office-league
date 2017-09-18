import {Component, Input, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';
import {List2Component} from '../../common/list2.component';

@Component({
    selector: 'admin-list',
    templateUrl: 'admin-list.component.html',
    styleUrls: ['admin-list.component.less']
})
export class AdminListComponent extends List2Component {
    @Input() admins: Player[];
    @Input() emptyMessage: string;
    @Output() removeAdmin: EventEmitter<Player> = new EventEmitter<Player>();

    constructor(route: ActivatedRoute, router: Router) {
        super(route, router);
    }

    onRemoveClicked(admin: Player) {
        this.removeAdmin.emit(admin);
    }
}
