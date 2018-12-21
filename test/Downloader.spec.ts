import {YIDownloader} from "../src/YIDownloader";
import PQueue from "p-queue";

describe("YIDownloader", function () {
    this.timeout(Infinity);

    // it('getListPage', async function () {
    //     let sl = new YIDownloader();
    //     let urls = await sl.getListPage("Фото девушек 25 лет", 2);
    //     // console.log(urls);
    // });

    it('getList', async function () {
        let sl = new YIDownloader();
        let urls = await sl.getList("Фото девушек 25 лет");
        console.log(urls);
    });

    it('download', async function () {
        let sl = new YIDownloader();
        await sl.download("https://i08.fotocdn.net/s25/206/gallery_m/377/2624288973.jpg");
        // console.log(urls);
    });


    it('go', async function () {
        let queue = new PQueue({
            concurrency: 10,
        });
        let sl = new YIDownloader();

        for (let page = 1; page <= 20; page++) {
            let urls = await sl.getList("фото парней 25 лет ok", page);
            console.log("page", page);
            if (urls.length == 0) {
                throw new Error("Empty result");
            }
            for (let url of urls) {
                queue.add(() => sl.downloadImage(url)
                    .then(() => console.log("ok " + url)))
                    .catch(e => console.error(e.message + " " + url));

            }
            // await queue.onIdle();
        }
        // console.log(urls);
    });
});