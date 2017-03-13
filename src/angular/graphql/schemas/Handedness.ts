export enum Handedness {
    RIGHT, LEFT, AMBIDEXTERITY
}

export class HandednessUtil {
    static parse(value: any): Handedness {
        if (typeof value === 'string') {
            return Handedness[value.toUpperCase()];
        }
        return null;
    }
}