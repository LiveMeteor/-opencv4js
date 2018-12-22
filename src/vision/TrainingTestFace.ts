import * as cv from 'opencv4nodejs';
import { FSTool } from '../FSTool';
import * as fs from 'fs';
import * as path from 'path';
import { DetectFace } from './DetectFace';
import { Dictionary } from '../data/Dictionary';
import { IndexValue } from '../data/IndexValue';

export module TrainingTestFace {

    /** 人脸识别器 */
    export let recognizer: cv.FaceRecognizer;
    /** 图像识别精度 */
    const cellLength: number = 128;

    /** 名字索引字典 */
    let values: IndexValue;
    /** 训练图片实体 */
    let trainingMats: cv.Mat[] = [];
    /** 训练图片索引 */
    let trainingIndexs: number[] = [];

    /** 从目录中训练脸部，子目录为名字 */
    export function trainingFromDirectory(directory: string): void
    {
        if (!recognizer)
        {
            console.error("Can not find Face Recognizer");
            return;
        }
        values = new IndexValue();
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
        let filepaths = FSTool.GetFilesFromDirectorySync(directory, "*", true, false);
        for (let f in filepaths)
        {
            let matFace = cv.imread(filepaths[f]);
            matFace = matFace.resize(cellLength, cellLength);
            matFace = matFace.bgrToGray();
            trainingMats.push(matFace);
            trainingIndexs.push(values.generalIndex(facename));
        }
    }

    /** 从一个目录测试 */
    export function testFromDirectory(directory: string): {filename: string, face: string, similar: number}[]
    {
        let dataFaces = DetectFace.getHeadDataFromDirectory(directory);
        let result = [];
        for (let k in dataFaces)
        {
            let filepath = path.resolve(directory, dataFaces[k].filePath);
            console.log(`Tesing image ${filepath}`);
            let image = cv.imread(filepath);
            image = image.bgrToGray();
            let faceRects = DetectFace.classifierFace.detectMultiScale(image).objects;
            for (let f in faceRects)
            {
                let face = image.getRegion(faceRects[f]);
                face.resize(cellLength, cellLength);
                let res = recognizer.predict(face);
                result.push({filename: dataFaces[k].filePath, face: values.getValue(res.label), similar: res.confidence});
            }
        }
        return result;
    }

}