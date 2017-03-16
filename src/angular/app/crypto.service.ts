import {Injectable} from '@angular/core';
declare var Crypto: any;

@Injectable()
export class CryptoService {
    public sha1(message: string): string {
        return Crypto.SHA1(message);
    }
}
