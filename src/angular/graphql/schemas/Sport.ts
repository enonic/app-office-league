export enum Sport {
    FOOS
}

export class SportUtil {
    static parse(value: any): Sport {
        if (typeof value === 'string') {
            return Sport[value.toUpperCase()];
        }
        return null;
    }
}