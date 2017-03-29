export enum Side {
    BLUE, RED
}

export class SideUtil {
    static parse(value: any): Side {
        if (typeof value === 'string') {
            return Side[value.toUpperCase()];
        }
        return null;
    }

    static toString(side: Side): string {
        return side != null ? Side[side] : '';
    }
}