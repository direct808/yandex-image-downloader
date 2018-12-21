import * as requestPromise from "request-promise";
import cheerio from "cheerio";
import * as fs from "fs";
import pThrottle from "p-throttle";


export class YIDownloader {

    private http = requestPromise.defaults({
        forever: true,
        gzip: true,
        jar: requestPromise.jar(),
        headers: {
            "Cache-Control": "max-age=0",
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Upgrade-Insecure-Requests": 1,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36",
        }
    });

    public constructor(private interval: number) {

    }


    public getList = pThrottle(this._getList, 1, this.interval * 1000);

    private async _getList(queryString: string, page = 1): Promise<string[]> {
        let html = await this.http.get("https://yandex.ru/images/search", {
            qs: {text: queryString, p: page == 1 ? undefined : page}
        });
        let $ = cheerio.load(html);
        return $(".serp-list .serp-item").map((i, element) => $(element).data("bem")['serp-item'].img_href).get();
    }

    public async downloadImage(filePath: string, url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            let req = this.http.get(url, {strictSSL: false});
            let fileStream = fs.createWriteStream(filePath);
            req.pipe(fileStream);
            req.catch(e => {
                fs.unlinkSync(filePath);
                reject(e);
            });
            req.on("end", resolve);
        });
    }
}