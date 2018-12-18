export module vision {

    export interface View3d {
        data: Buffer;
        offset: number;
        order: number[];
        shape: number[];
        size: number;
        stride: number[];
    }

    export function GetPixels(path: string, func: (buffer: View3d) => void, thisObj?: any): void
    {
        let getPixels = require("get-pixels");
        getPixels(path, (err: Error, buffer: View3d) => {
            if (err) {
                console.log(err.message);
                return;
            }
            func.call(thisObj, buffer);
        });
    }
}