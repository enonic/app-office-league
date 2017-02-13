import {isBlank, isStrictStringMap} from '@angular/platform-browser-dynamic/src/facade/lang';
import {isString, isArray} from 'util';

export class GraphQLUtils {

    static createQuery(dataDefinition: Object, method: string, parameters: Object, queryName?: string): string {
        if (!method || !dataDefinition) { return null }

        let query: string = 'query ' + (queryName || method) + '{' + method;

        query += '(' + GraphQLUtils.flattenObject(parameters) + ')';

        query += GraphQLUtils.processDataDefinition(dataDefinition) + '}';

        return query
    }

    private static processDataDefinition(dataDefinition: Object): string {
        if (!dataDefinition) { return '' }

        let query: string = '';

        let keys: string[] = Object.keys(dataDefinition);
        keys.forEach((key: string, index: number) => {
            if (!index) { query += '{' }

            query += key;

            if (dataDefinition[key] instanceof Array && dataDefinition[key].length) {
                query += GraphQLUtils.processDataDefinition(dataDefinition[key][0])
            } else if (dataDefinition[key] instanceof Object) {
                query += GraphQLUtils.processDataDefinition(dataDefinition[key])
            }

            if (index === (keys.length - 1)) {
                query += '}'
            } else {
                query += ','
            }
        });

        return query
    }

    private static flattenObject(object: Object): string {
        return Object.keys(object || {}).reduce((array: any[], key: string) => {
            if (!isBlank(object[key])) { array.push(key + ':' + GraphQLUtils.processValue(object[key])) }

            return array
        }, []).join(',')
    }

    private static processValue(value: any): string {
        if (isBlank(value)) { return '' }

        if (isString(value)) { return '"' + value + '"' }

        if (isArray(value)) {
            let arrayString: string = '[';

            value.forEach((valueInArray: any, index: number) => {
                arrayString += GraphQLUtils.processValue(valueInArray);
                if (index !== value.length - 1) { arrayString += ',' }
            });

            arrayString += ']';

            return arrayString
        }

        if (isStrictStringMap(value)) {
            let objectString: string = '{';

            let keys: string[] = Object.keys(value);
            keys.forEach((key: string, index: number) => {
                objectString += key + ':' + GraphQLUtils.processValue(value[key]);
                if (index !== keys.length - 1) { objectString += ',' }
            });

            objectString += '}';

            return objectString
        }

        return value.toString()
    }
}
