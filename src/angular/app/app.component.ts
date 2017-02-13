import {Component} from '@angular/core';
import {AuthService} from './auth.service';

@Component({
  selector: 'office-league',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.less']
})
export class AppComponent {

  constructor(private auth: AuthService) {

  }
}