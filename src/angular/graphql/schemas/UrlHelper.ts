export class UrlHelper {

    static trimSlash(url: string): string {
        if (url && url[url.length - 1] === '/') {
            return url.substring(0, url.length - 1);
        }
        return url;
    }

}
