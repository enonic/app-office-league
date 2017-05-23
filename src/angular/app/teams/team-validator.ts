import {AbstractControl, AsyncValidatorFn, FormGroup, ValidatorFn} from '@angular/forms';
import {GraphQLService} from '../services/graphql.service';

export class TeamValidator {

    private static TEAM_VALIDATION_MESSAGES = {
        'name': {
            'required': 'Name is required.',
            'minlength': 'Name must be at least 3 characters long.',
            'maxlength': 'Name must be no longer than 40 characters.',
            'nameinuse': 'This name is already taken, sorry.',
            'invalidname': 'The name contains invalid characters.'
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
                const messages = TeamValidator.TEAM_VALIDATION_MESSAGES[field];
                for (const key in control.errors) {
                    formErrors[field] += messages[key] + ' ';
                }
            }
        }
    }

    static nameInUseValidator(graphQLService: GraphQLService, id?: string): AsyncValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            const name = control.value;
            return graphQLService.post(TeamValidator.teamNameInUseQuery, {name: name}).then(data => {
                return data && data.team && (data.team.id !== id) ? {'nameinuse': true} : null;
            });
        };
    }

    private static readonly teamNameInUseQuery = `query($name: String) {
        team(name: $name) {
            id
        }
    }`;

}