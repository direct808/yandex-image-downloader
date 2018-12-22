"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minimist_1 = __importDefault(require("minimist"));
const YIDownloader_1 = require("./YIDownloader");
exports.YIDownloader = YIDownloader_1.YIDownloader;
const p_queue_1 = __importDefault(require("p-queue"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const argv = minimist_1.default(process.argv.slice(2), {
    default: {
        c: 30,
        i: 15,
        t: 10,
        o: 1,
    }
});
let interval = argv.i;
let count = argv.c;
let offset = argv.o;
let queryString = argv._.join(" ");
if (queryString.length == 0) {
    process.exit();
}
let directory = "./" + queryString + "/";
mkdirp_1.default.sync(directory);
let queue = new p_queue_1.default({ concurrency: argv.t });
let downloader = new YIDownloader_1.YIDownloader(interval);
let index = 1;
let pageStart = Math.ceil(offset / 30);
let pageEnd = Math.ceil((count + offset - 1) / 30);
let curIndex = (pageStart - 1) * 30;
console.log("Download", count, "photos", "Start with", offset, "Query string:", queryString);
// console.log("pageStart", pageStart, "pageEnd", pageEnd);
(() => __awaiter(this, void 0, void 0, function* () {
    for (let page = pageStart; page <= pageEnd; page++) {
        let urls = yield downloader.getList(queryString, page);
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
}))();
