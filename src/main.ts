import * as path from 'path';
import * as cv from 'opencv4nodejs';
import { DetectFace } from "./vision/DetectFace";
import { TrainingTestFace } from "./vision/TrainingTestFace";

// import http = require('http');
// var port = process.env.port || 1337;
// http.createServer(function (req, res) {
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     res.end('Hello World\n');
// }).listen(port);
// console.log(`Server Started! Please visit http://127.0.0.1:${port}`);

let resource = "./resource";

let sourcePath = path.resolve(resource, "source");
let facesPath = path.resolve(resource, "faces");
let trainingPath = path.resolve(resource, "training");
let testPath = path.resolve(resource, "test");

function detect(): void
{
    let headDataArr = DetectFace.getHeadDataFromDirectory(sourcePath);
    for (let k in headDataArr)
    {
        let headData = headDataArr[k];
        let pathObj = path.parse(headData.filePath);

        //输出检测结果
        let outFilepath = path.resolve(facesPath, pathObj.name + pathObj.ext);
        cv.imwrite(outFilepath, DetectFace.drawHeadData(headData));
        console.log(`Write face file ${outFilepath} succeed`);

        //创建训练图片
        let clips = DetectFace.clipHeadData(headData, 128, true);
        for (let c in clips)
        {
            outFilepath = path.resolve(trainingPath, pathObj.name + "_" + c + pathObj.ext);
            cv.imwrite(outFilepath, clips[c]);
            console.log(`Write training file ${outFilepath} succeed`);
        }
    }
}

function training(): void
{
    TrainingTestFace.recognizer = new cv.LBPHFaceRecognizer();
    TrainingTestFace.trainingFromDirectory(trainingPath);
}

function executeTest(): void
{
    let dataFaces = DetectFace.getHeadDataFromDirectory(testPath, 1);

    for (let f in dataFaces)
    {
        let pathObj = path.parse(dataFaces[f].filePath);

        if (dataFaces[f].headRect.length == 0)
        {
            console.log(`Can not find head from ${dataFaces[f].filePath}`);
            continue;
        }
        let testMats = DetectFace.clipHeadData(dataFaces[f], 128, true);
        for (let m in testMats)
        {
            let compare = TrainingTestFace.recognizer.predict(testMats[m]);
            console.log(`Find head from ${dataFaces[f].filePath}, similar ${compare.confidence}`);
            
            let outFilepath = path.resolve(testPath, pathObj.name + "_S" + Math.floor(compare.confidence) + pathObj.ext);
            cv.imwrite(outFilepath, testMats[m]);
            console.log(`Write test head ${outFilepath} succeed`);
        }
    }
    console.log("Execute test finished.");
}

if (process.argv.indexOf("detect") != -1)
{
    console.log("----Detect----");
    detect();
}

if (process.argv.indexOf("test") != -1)
{
    console.log("----Training----");
    training();
    console.log("----ExecuteTest----");
    executeTest();
}