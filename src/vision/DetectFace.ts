import * as cv from 'opencv4nodejs';
import { FSTool } from '../FSTool';

/** 检测到的面部数据 */
export interface HeadData {
    source: cv.Mat;
    filePath: string;
    headRect: { face: cv.Rect, eyes: cv.Rect[] }[];
}

/** 人脸检测工具 */
export module DetectFace {

    /** 面部检查分类器 */
    export const classifierFace = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_DEFAULT);
    /** 眼睛检查分类器 */
    export const classifierEye = new cv.CascadeClassifier(cv.HAAR_EYE);
    // export const classifierEye = new cv.CascadeClassifier(cv.HAAR_EYE_TREE_EYEGLASSES);

    /** 从图像中获取头像 */
    export function getHeadDataByMat(mat:cv.Mat, checkEyeStrength: number = 2): HeadData {
        let grayMat = mat.bgrToGray();
        let faceRects = classifierFace.detectMultiScale(grayMat, 1.1)["objects"] as cv.Rect[];
        let eyeRects = classifierEye.detectMultiScale(grayMat, 1.4)["objects"] as cv.Rect[];
        let headRect = [];
        for (let f in faceRects)
        {
            let validEyes: cv.Rect[] = [];
            for (let e in eyeRects)
            {
                if (inRect(eyeRects[e], faceRects[f]))
                    validEyes.push(eyeRects[e]);
            }
            if (validEyes.length >= checkEyeStrength)
            {
                headRect.push({ face: faceRects[f], eyes: validEyes });
            }
            // headRect.push({ face: faceRects[f], eyes: eyeRects });
        }
        return {source: mat, filePath: null, headRect: headRect};
    }

    /** 绘制面部头像 */
    export function drawHeadData(value: HeadData): cv.Mat
    {
        let newMat = value.source.copy();
        for (let h in value.headRect)
        {
            let head = value.headRect[h];
            newMat.drawRectangle(head.face, new cv.Vec3(255, 0, 0), 8);
            for (let e in head.eyes) {
                newMat.drawRectangle(head.eyes[e], new cv.Vec3(0, 255, 0), 8);
            }
        }
        return newMat;
    }

    /** 裁剪面部头像 */
    export function clipHeadData(value: HeadData, size?: number, gray?: boolean): cv.Mat[]
    {
        let newMats: cv.Mat[] = [];
        for (let k in value.headRect)
        {
            let headClip = value.source.getRegion(value.headRect[k].face);
            size && (headClip = headClip.resize(size, size));
            gray && (headClip = headClip.bgrToGray());
            newMats.push(headClip);
        }
        return newMats;
    }

    function inRect(subRect: cv.Rect, largeRect: cv.Rect): boolean
    {
        let result = 0;
        result += (subRect.x >= largeRect.x ? 1 : 0);
        result += (subRect.x + subRect.width <= largeRect.x + largeRect.width ? 1 : 0);
        result += (subRect.y >= largeRect.y ? 1 : 0);
        result += (subRect.y + subRect.height <= largeRect.y + largeRect.height ? 1 : 0);
        return result >= 4;
    }

    /** 从目录中的所有文件中获取头部数据 */
    export function getHeadDataFromDirectory(directory: string, checkEyeStrength: number = 2): HeadData[] {
        let result: HeadData[] = [];
        let filesPath = FSTool.GetFilesFromDirectorySync(directory, "*", true, false);
        for (let k in filesPath)
        {
            let image = cv.imread(filesPath[k]);
            console.log(`Detect face from ${filesPath[k]}`);
            let faceData = getHeadDataByMat(image, checkEyeStrength);
            faceData.filePath = filesPath[k];
            result.push(faceData);
        }
        return result;
    }
}