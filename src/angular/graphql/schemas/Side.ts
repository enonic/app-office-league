export enum Side {
    BLUE, RED
}

export class SideUtil {
    static parseSide(value: any): Side {
        if (typeof value === 'string') {
            return Side[value.toUpperCase()];
        }
        return null;
    }
}