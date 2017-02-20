import {Entity} from './Entity';

export class NamedEntity extends Entity {
    name: string;

    constructor(id: string, name: string) {
        super(id);
        if (!name) {
            throw new Error('[name] cannot be null');
        }
        this.name = name;
    }
}