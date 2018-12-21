import minimist from "minimist";
import {YIDownloader} from "./YIDownloader";
import PQueue from "p-queue";
import mkdirp from "mkdirp";

const argv = minimist(process.argv.slice(2), {
    default: {
        c: 30,
        i: 15,
        t: 10,
        o: 1,
    }
});

let interval = argv.i as number;
let count = argv.c as number;
let offset = argv.o as number;
let queryString = argv._.join(" ");

if (queryString.length == 0) {
    process.exit();
}

let directory = "./" + queryString + "/";
mkdirp.sync(directory);

let queue = new PQueue({concurrency: argv.t});
let downloader = new YIDownloader(interval);

let index = 1;
let pageStart = Math.ceil(offset / 30);
let pageEnd = Math.ceil((count + offset - 1) / 30);
let curIndex = (pageStart - 1) * 30;

console.log("Download", count, "photos", "Start with", offset, "Query string:", queryString);
// console.log("pageStart", pageStart, "pageEnd", pageEnd);


(async () => {
    for (let page = pageStart; page <= pageEnd; page++) {
        let urls = await downloader.getList(queryString, page);
        console.log("page", page);
        if (urls.length == 0) {
            throw new Error("Empty result");
        }
        for (let url of urls) {
            curIndex++;
            if (curIndex < offset) {
                continue;
            }
            ((curIndex) => {
                queue.add(() => downloader.downloadImage(directory + curIndex + ".jpg", url)
                    .then(() => console.log("#" + curIndex + " ok " + url)))
                    .catch(e => console.error("#" + curIndex + " " + e.message + " " + url));
            })(curIndex);
            if (index >= count) {
                return;
            }
            index++;
        }
    }
})();

export {YIDownloader};