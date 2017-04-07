import {AbstractControl, ValidatorFn} from '@angular/forms';

export class CustomValidators {

    static minLength(length: number): ValidatorFn {
        return (control: AbstractControl) => {
            return (control.value || '').trim().length < length ? {'minlength': true} : null;
        };
    }

    static maxLength(length: number): ValidatorFn {
        return (control: AbstractControl) => {
            return (control.value || '').trim().length > length ? {'maxlength': true} : null;
        };
    }

}