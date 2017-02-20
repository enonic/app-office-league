export class DateUtil {
    static parseDate(value: string): Date {
        if (value) {
            try {
                return new Date(value);
            } catch (e) {
                console.warn(`Could not parse date from: "${value}"`);
            }
        }
        return null;
    }
}
