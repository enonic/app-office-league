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

    static getColor(side: Side): string {
        switch (side) {
        case Side.BLUE: return 'blue';
        case Side.RED: return 'red';
        default: return '';
        }
    }
}
