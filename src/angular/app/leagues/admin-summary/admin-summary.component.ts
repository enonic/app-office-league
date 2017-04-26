import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {Player} from '../../../graphql/schemas/Player';
import {ActivatedRoute} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {BaseComponent} from '../../common/base.component';

@Component({
    selector: 'admin-summary',
    templateUrl: 'admin-summary.component.html',
    styleUrls: ['admin-summary.component.less']
})
export class AdminSummaryComponent
    extends BaseComponent {

    @Input() admin: Player;
    @Output() removeAdmin: EventEmitter<Player> = new EventEmitter<Player>();
    isCurrentPlayer: boolean;

    constructor(route: ActivatedRoute, private authService: AuthService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let currentPlayerId = this.authService.isAuthenticated() ? this.authService.getUser().playerId : '-1';
        this.isCurrentPlayer = currentPlayerId === (this.admin && this.admin.id);
    }

    onRemoveClicked(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.removeAdmin.emit(this.admin);
    }

}