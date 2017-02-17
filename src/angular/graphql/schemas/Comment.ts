import {Player} from './Player';

export class Comment {
    id: string;
    text: string;
    author: Player;
    likes: Player[] = [];

    constructor(text: string, author: Player) {
        if (!text) {
            throw new Error('Comment.text can not be null');
        }
        if (!author) {
            throw new Error('Comment.author can not be null');
        }
        this.text = text;
        this.author = author;
    }

    static fromJson(json: any): Comment {
        let c = new Comment(json.text, Player.fromJson(json.author));
        if (json.id) {
            c.id = json.id;
        }
        if (json.likes) {
            c.likes = json.likes.map(player => Player.fromJson(player));
        }
        return c;
    }
}
