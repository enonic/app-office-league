export class RankingHelper {

    static ordinal(value: number) {
        if (!value) {
            return '';
        }
        switch (value) {
        case 1:
            return 'st';
        case 2:
            return 'nd';
        case 3:
            return 'rd';
        default:
            return 'th';
        }
    }
}