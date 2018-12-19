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

function detect(): void
{
    let sourcePath = path.resolve(resource, "source");
    let facesPath = path.resolve(resource, "faces");

    let faces = DetectFace.getFacesFromDirectory(sourcePath);
    for (let k in faces)
    {
        let dataFace = faces[k];
        let namesSpt = dataFace.filename.split(".");
        for (let m in dataFace.mats)
        {
            let outFilepath = path.resolve(facesPath, namesSpt[0] + "_" + m + "." + namesSpt[1]);
            cv.imwrite(outFilepath, dataFace.mats[m]);
            console.log(`Write face file ${outFilepath} succeed`);
        }
    }
}

function trainingAndTest(): void
{
    TrainingTestFace.recognizer = new cv.LBPHFaceRecognizer();

    let trainingPath = path.resolve(resource, "training");
    let testPath = path.resolve(resource, "test");

    //training
    TrainingTestFace.trainingFromDirectory(trainingPath);
    //test
    let result = TrainingTestFace.testFromDirectory(testPath);

    for (let k in result)
    {
        console.log(`Test result: ${result[k].filename} is ${result[k].face}. (Similar ${result[k].similar})`);
    }
}

// detect();
trainingAndTest();