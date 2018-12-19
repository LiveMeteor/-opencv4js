import * as cv from 'opencv4nodejs';
import { FSTool } from '../FSTool';
import * as fs from 'fs';
import * as path from 'path';
import { DetectFace } from './DetectFace';

export module TrainingTestFace {

    /** 人脸识别器 */
    export let recognizer: cv.FaceRecognizer;
    /** 图像识别精度 */
    let cellLength: number = 128;

    /** 人脸索引计数器 */
    let indexCounter: number = 0;
    /** 人脸索引字典 */
    let indexDic: object = {};
    /** 人脸索引反向字典 */
    let indexDicRev: object = {};
    /** 训练图片实体 */
    let trainingMats: cv.Mat[] = [];
    /** 训练图片索引 */
    let trainingIndexs: number[] = [];

    /** 通过人名获取或生成训练索引 */
    function getTraingIndex(facename: string): number
    {
        if (indexDic[facename])
            return <number>indexDic[facename];

        indexCounter++;
        indexDic[facename] = indexCounter;
        indexDicRev[indexCounter] = facename;
        return <number>indexDic[facename];
    }

    /** 通过索引获取人名 */
    function getFaceName(index: number): string
    {
        let name = indexDicRev[index];
        if (name == null)
            return "";
        else
            return name;
    }

    /** 从目录中训练人脸，子目录为人名 */
    export function trainingFromDirectory(directory: string): void
    {
        if (!recognizer)
        {
            console.error("Can not find Face Recognizer");
            return;
        }
        trainingMats = [];
        trainingIndexs = [];
        let files = fs.readdirSync(directory);
        for (let k in files)
        {
            let stats = fs.statSync(path.resolve(directory, files[k]));
            if (stats.isDirectory())
            {
                trainingFromSubDirectory(path.resolve(directory, files[k]), files[k]);
            }
        }
        recognizer.train(trainingMats, trainingIndexs);
        console.log(`Training finished.`);
    }

    function trainingFromSubDirectory(directory: string, facename: string): void
    {
        console.log(`Training face ${facename}`);
        let files = FSTool.GetFilesFromDirectorySync(directory, "*", false, false);
        for (let k in files)
        {
            let filePath = path.resolve(directory, files[k]);
            let matFace = cv.imread(filePath);
            matFace = matFace.resize(cellLength, cellLength);
            matFace = matFace.bgrToGray();
            trainingMats.push(matFace);
            trainingIndexs.push(getTraingIndex(facename));
        }
    }

    /** 从一个目录测试 */
    export function testFromDirectory(directory: string): {filename: string, face: string, similar: number}[]
    {
        let dataFaces = DetectFace.getFacesFromDirectory(directory);
        let result = [];
        for (let k in dataFaces)
        {
            let filepath = path.resolve(directory, dataFaces[k].filename);
            console.log(`Tesing image ${filepath}`);
            let image = cv.imread(filepath);
            image = image.bgrToGray();
            let faceRects = DetectFace.classifier.detectMultiScale(image).objects;
            for (let f in faceRects)
            {
                let face = image.getRegion(faceRects[f]);
                face.resize(cellLength, cellLength);
                let res = recognizer.predict(face);
                result.push({filename: dataFaces[k].filename, face: getFaceName(res.label), similar: res.confidence});
            }
        }
        return result;
    }

}