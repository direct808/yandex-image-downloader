"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const requestPromise = __importStar(require("request-promise"));
const cheerio_1 = __importDefault(require("cheerio"));
const fs = __importStar(require("fs"));
const p_throttle_1 = __importDefault(require("p-throttle"));
class YIDownloader {
    constructor(interval) {
        this.interval = interval;
        this.http = requestPromise.defaults({
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
        this.getList = p_throttle_1.default(this._getList, 1, this.interval * 1000);
    }
    _getList(queryString, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            let html = yield this.http.get("https://yandex.ru/images/search", {
                qs: { text: queryString, p: page == 1 ? undefined : page }
            });
            let $ = cheerio_1.default.load(html);
            return $(".serp-list .serp-item").map((i, element) => $(element).data("bem")['serp-item'].img_href).get();
        });
    }
    downloadImage(filePath, url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let req = this.http.get(url, { strictSSL: false });
                let fileStream = fs.createWriteStream(filePath);
                req.pipe(fileStream);
                req.catch(e => {
                    fs.unlinkSync(filePath);
                    reject(e);
                });
                req.on("end", resolve);
            });
        });
    }
}
exports.YIDownloader = YIDownloader;
