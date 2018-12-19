import * as cv from 'opencv4nodejs';
import * as path from 'path';
import { FSTool } from '../FSTool';

export module DetectFace {

    export const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

    /** 从图像中获取头像 */
    export function getFacesFromImage(mat:cv.Mat): cv.Mat[] {
        let grayImg = mat.bgrToGray();
        let faceRects = classifier.detectMultiScale(grayImg).objects;
        if (!faceRects.length) {
            return [];
        }
        let faces: cv.Mat[] = [];
        for (let k in faceRects)
        {
            faces.push(mat.getRegion(faceRects[k]));
        }
        return faces;
    }

    /** 从目录中的所有文件中获取头像 */
    export function getFacesFromDirectory(directory: string): {filename: string, mats: cv.Mat[]}[] {
        let rtn = [];
        let files = FSTool.GetFilesFromDirectorySync(directory);
        for (let k in files)
        {
            let filepath = path.resolve(directory, files[k]);
            let image = cv.imread(filepath);
            console.log(`Detect face from ${filepath}`);
            let faces = getFacesFromImage(image);
            rtn.push({filename: files[k], mats: faces});
        }
        return rtn;
    }


}