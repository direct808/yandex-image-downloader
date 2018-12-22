export declare class YIDownloader {
    private interval;
    private http;
    constructor(interval: number);
    getList: (queryString: string, page?: number) => Promise<string[]>;
    private _getList;
    downloadImage(filePath: string, url: string): Promise<void>;
}
