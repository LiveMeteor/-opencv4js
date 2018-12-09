import { FSTool } from "./FSTool";
import * as path from 'path';
import * as fs from 'fs';

// import http = require('http');
// var port = process.env.port || 1337;
// http.createServer(function (req, res) {
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     res.end('Hello World\n');
// }).listen(port);
// console.log(`Server Started! Please visit http://127.0.0.1:${port}`);

let resource = "./resource";

function run() {
    let files = FSTool.GetFilesFromDirectorySync(resource);
    var getPixels = require("get-pixels");

    getPixels(path.join(resource, files[0]), function (err, pixels) {
        if (err) {
            console.log("Bad image path");
            return;
        }
        console.log("got pixels", pixels.shape.slice());
    });


    let zeros = require("zeros");
    let savePixels = require("save-pixels");
    //Create an image
    let x = zeros([32, 32]);
    x.set(16, 16, 255)
    
    //Save to a file
    // let buffer = savePixels(x, "png");
    // fs.writeFileSync("test.png", buffer.data);

    // var buffer = fs.createWriteStream('output.txt');
    // var Base64Encode = require('base64-stream').Base64Encode;
    // let enc = new Base64Encode();


    // savePixels(x, 'png').on('end', function() {
    //     //Writes a DataURL to  output.txt
    //     buffer.write("data:image/png;base64,"+enc.read().toString());
    //     fs.writeFileSync("test.png", buffer.data, {});
    // }).pipe(enc);


    // open a file called "lenna.png"

    var Jimp = require('jimp');
    Jimp.read(path.join(resource, files[0]), (err, lenna) => {
        if (err)
            throw err;
        lenna.resize(256, 256) // resize

        lenna.quality(60) // set JPEG quality
        lenna.greyscale() // set greyscale
        let pixel = lenna.getPixelColour(100, 100);
        console.log(pixel);

        lenna.write('lena-small-bw.jpg'); // save

    });


}

run();