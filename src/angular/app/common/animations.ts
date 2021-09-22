// NOT used

// import {trigger, state, animate, style, transition} from '@angular/core';

// export function slideLeft(triggerName: string = 'routerTransition') {
//     return trigger(triggerName, [
//         state('void', style({position: 'fixed'})),
//         state('*', style({position: 'fixed'})),
//         transition(':enter', [  // before 2.1: transition('void => *', [
//             style({transform: 'translateX(100%)'}),
//             animate('0.5s ease-in-out', style({transform: 'translateX(0%)'}))
//         ]),
//         transition(':leave', [  // before 2.1: transition('* => void', [
//             style({transform: 'translateX(0%)'}),
//             animate('0.5s ease-in-out', style({transform: 'translateX(-100%)'}))
//         ])
//     ]);
// }
