import { FSTool } from "./FSTool";
import { vision } from "./vision/VisionUtils";
import * as path from 'path';
import * as Jimp from 'jimp';
import * as cv from 'opencv4nodejs';
import * as fs from "fs";

// import http = require('http');
// var port = process.env.port || 1337;
// http.createServer(function (req, res) {
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     res.end('Hello World\n');
// }).listen(port);
// console.log(`Server Started! Please visit http://127.0.0.1:${port}`);

let resource = "./resource";
const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

function run() {

    // prcessImage();
    // let files = FSTool.GetFilesFromDirectorySync(resource);

    // const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
    // let mat = cv.imread(path.join(resource, files[0]));
    // let grayImg = mat.bgrToGray();
    // let res = classifier.detectMultiScale(grayImg);
    // console.log(res);

    const sourcePath = path.resolve(resource, 'imgs');
    const facePath = path.resolve(resource, 'face_imgs');
    
    let files = fs.readdirSync(sourcePath);
    files.forEach(file => {
        let filePath = path.resolve(sourcePath, file);
        let img = cv.imread(filePath);
        img = img.bgrToGray();
        let faces = getFaceImage(img);
        if (faces.length == 0)
        return;
        for (let k in faces)
        {
            let face = faces[k].resize(128, 128);
            console.log(`save face ${file}`);
            cv.imwrite(path.resolve(facePath, `F${k}` + file), face);
        }
    });

    return;

    /*
    const images = imgFiles
        // get absolute file path
        .map(file => path.resolve(imgsPath, file))
        // read image
        .map(filePath => cv.imread(filePath))
        // face recognizer works with gray scale images
        .map(img => img.bgrToGray())
        // detect and extract face
        .map(getFaceImage)
        // face images must be equally sized
        .map(faceImg => faceImg.resize(80, 80));

    const isImageFour = (_, i) => imgFiles[i].includes('4');
    const isNotImageFour = (_, i) => !isImageFour(_, i);
    // use images 1 - 3 for training
    const trainImages = images.filter(isNotImageFour);
    // use images 4 for testing
    const testImages = images.filter(isImageFour);
    // make labels
    const labels = imgFiles
        .filter(isNotImageFour)
        .map(file => nameMappings.findIndex(name => file.includes(name)));
    
    */

}

function getFaceImage(grayImg:cv.Mat): cv.Mat[] {
    const faceRects = classifier.detectMultiScale(grayImg).objects;
    if (!faceRects.length) {
        return [];
    }
    let faces: cv.Mat[] = [];
    for (let k in faceRects)
    {
        faces.push(grayImg.getRegion(faceRects[k]));
    }
    return faces;
}

function training(): void
{
    const eigen = new cv.EigenFaceRecognizer();
    
    const trainingPath = path.resolve(resource, 'face_input');
    const testPath = path.resolve(resource, 'face_test');

    let trainingFiles = fs.readdirSync(trainingPath);
    let trainingMats: cv.Mat[] = [];
    let trainingIndexs: number[] = [];
    trainingFiles.forEach(file => {
        let filePath = path.resolve(trainingPath, file);
        let img = cv.imread(filePath);
        trainingMats.push(img);
        trainingIndexs.push(transFileNameToIndex(file));
    });
    console.log("Training...", trainingMats, trainingIndexs);
    eigen.train(trainingMats, trainingIndexs);

    console.log("Testing...");
    let testFiles = fs.readdirSync(testPath);
    testFiles.forEach(file => {
        let filePath = path.resolve(testPath, file);
        console.log(filePath);
        let img = cv.imread(filePath);
        let result = eigen.predict(img);
        console.log(file, result);
    });


    
}

function transFileNameToIndex(fileName: string): number
{
    let word = fileName.substr(0, 1);
    switch (word)
    {
        case "A":
            return 101;
        case "B":
            return 102;
        case "C":
            return 103;
        default:
            return -1;
    }
}


async function prcessImage(): Promise<void>
{
    let files = FSTool.GetFilesFromDirectorySync(resource);
    for (let k in files)
    {
        let dataImage = await Jimp.read(path.join(resource, files[k]));
        dataImage.resize(512, Jimp.AUTO);
        dataImage = await changePixel(dataImage);

        dataImage.write("output.jpg");
    }
}

async function changePixel(dataImage: Jimp): Promise<Jimp>
{
    let size = {width: dataImage.getWidth(), height: dataImage.getHeight()};
    for (let x = 0; x < size.width; x++)
    {
        for (let y = 0; y < size.height; y++)
        {
            let pixel = dataImage.getPixelColor(x, y);
            let pixelRGB = Jimp.intToRGBA(pixel);
            pixelRGB.r += 10;
            pixelRGB.g += 10;
            pixelRGB.b += 10;
            let newPixel = Jimp.rgbaToInt(
                Math.min(pixelRGB.r, 255), 
                Math.min(pixelRGB.g, 255), 
                Math.min(pixelRGB.b, 255), pixelRGB.a, () => {});
            try
            {
                dataImage.setPixelColor(newPixel, x, y);
            }
            catch (err)
            {
                console.log(newPixel, x, y);
            }
            // dataImage.setPixelColor(newPixel, x, y);
        }
    }
    return dataImage;

}

// run();
training();