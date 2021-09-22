import {AbstractControl, AsyncValidatorFn, FormGroup} from '@angular/forms';
import {GraphQLService} from '../services/graphql.service';

export class PlayerValidator {

    private static PLAYER_VALIDATION_MESSAGES = {
        'name': {
            'required': 'Name is required.',
            'minlength': 'Name must be at least 3 characters long.',
            'maxlength': 'Name must be no longer than 40 characters.',
            'nameinuse': 'This name is already taken, sorry.',
            'invalidname': 'The name contains invalid characters.',
            'invalidwhitespace': 'The name contains space characters.'
        },
        'fullname': {
            'required': 'Full name is required.',
            'minlength': 'Full name must be at least 3 characters long.',
            'maxlength': 'Full name must be no longer than 40 characters.',
        }
    };

    static updateFormErrors(form: FormGroup, formErrors: { [key: string]: string }) {
        if (!form) {
            return;
        }

        for (const field in formErrors) {
            // clear previous error message (if any)
            formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = PlayerValidator.PLAYER_VALIDATION_MESSAGES[field];
                for (const key in control.errors) {
                    formErrors[field] += messages[key] + ' ';
                }
            }
        }
    }

    static nameInUseValidator(graphQLService: GraphQLService, id?: string): AsyncValidatorFn {
        return (control: AbstractControl): Promise<{ [key: string]: any }> => {
            const name = control.value;
            return graphQLService.post(PlayerValidator.playerNameInUseQuery, {name: name}).then(data => {
                return data && data.player && (data.player.id !== id) ? {'nameinuse': true} : null;
            });
        };
    }

    private static readonly playerNameInUseQuery = `query($name: String){
        player(name: $name) {
            id
        }
    }`;

}