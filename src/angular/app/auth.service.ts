import {Injectable} from '@angular/core';

@Injectable()
export class AuthService {

    public login() {
        console.log('Login now');
    };

    public isAuthenticated() {
        return true;
    };

    public logout() {
        console.log('Logout now');
    };

}
