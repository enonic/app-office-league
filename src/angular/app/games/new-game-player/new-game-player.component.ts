import {Component, Input, Output, EventEmitter, ElementRef, HostBinding, HostListener} from '@angular/core';
import {Player} from '../../../graphql/schemas/Player';
import {XPCONFIG} from '../../app.config';
import {MaterializeAction} from 'angular2-materialize';

@Component({
    selector: 'new-game-player',
    templateUrl: 'new-game-player.component.html',
    styleUrls: ['new-game-player.component.less']
})
export class NewGamePlayerComponent {
    materializeActions = new EventEmitter<string|MaterializeAction>();

    @Input() player: Player;
    @Input() possiblePlayerIds: string[];
    @Input() sideClass: string;
    @Output() playerSelected: EventEmitter<Player> = new EventEmitter<Player>();
    @Output() animationFinished: EventEmitter<NewGamePlayerComponent>;

    playerSelectEnabled: boolean;
    private modalTitle: string = 'Select a player';

    @HostBinding('style.left.px')
    private x: number = 0;

    @HostBinding('style.top.px')
    private y: number = 0;

    @HostBinding('class.animate')
    private animate: boolean = true;
    private animatedProperties: string[] = [];


    @HostListener('transitionend', ['$event'])
    private onTransitionFinished(event: TransitionEvent) {
        this.animatedProperties = this.animatedProperties.filter(prop => {
            return prop !== event.propertyName;
        });
        // all properties finished animation
        if (this.animatedProperties.length == 0) {
            this.animationFinished.emit(this);
        }
    }

    constructor(private el: ElementRef) {
        this.animationFinished = new EventEmitter<NewGamePlayerComponent>();
    }

    public setPlayer(player: Player) {
        this.player = player;
        this.playerSelected.emit(player);
    }

    public getPosition(): {x: number, y: number} {
        return {
            x: this.el.nativeElement.offsetLeft,
            y: this.el.nativeElement.offsetTop
        }
    }

    public setPosition(pos: {x: number, y: number}, animate: boolean = true) {
        this.animate = animate;
        let myPos = this.getPosition();
        let newX = this.x + pos.x - myPos.x;
        let newY = this.y + pos.y - myPos.y;
        this.setPositionAndMarkAnimatedProperties(animate, newX, newY);
    }

    public resetPosition(animate: boolean = true) {
        this.animate = animate;
        this.setPositionAndMarkAnimatedProperties(animate, 0, 0);
    }

    private setPositionAndMarkAnimatedProperties(animate: boolean, newX: number, newY: number) {
        if (newX != this.x) {
            if (animate) {
                this.animatedProperties.push('left');
            }
            this.x = newX;
        }
        if (newY != this.y) {
            if (animate) {
                this.animatedProperties.push('top');
            }
            this.y = newY;
        }
    }

    onClicked() {
        this.showModal();
    }

    onSelected(p: Player) {
        if (p) {
            this.hideModal();
            this.playerSelected.emit(p);
        }
    }

    public showModal(): void {
        this.materializeActions.emit({action: "modal", params: ['open']});
        this.playerSelectEnabled = true;
    }

    public hideModal(): void {
        this.playerSelectEnabled = false;
        this.materializeActions.emit({action: "modal", params: ['close']});
    }

    questionMarkImg(): string {
        return `${XPCONFIG.assetsUrl}/img/questionmark.svg`;
    }
}
