import {Entity} from './Entity';

export class NamedEntity extends Entity {
    name: string;

    constructor(id: string, name: string) {
        super(id);
        this.name = name;
    }
}