import { FSTool } from "./FSTool";
import * as path from 'path';
import * as fs from 'fs';
import * as Jimp from 'jimp';

// import http = require('http');
// var port = process.env.port || 1337;
// http.createServer(function (req, res) {
//     res.writeHead(200, { 'Content-Type': 'text/plain' });
//     res.end('Hello World\n');
// }).listen(port);
// console.log(`Server Started! Please visit http://127.0.0.1:${port}`);

let resource = "./resource";

function run() {

    prcessImage();
    return;
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

    // var Jimp = require('jimp');
    // Jimp.read(path.join(resource, files[0]), (err, lenna) => {
    //     if (err)
    //         return err.toString();

    //     lenna.resize(256, 256) // resize

    //     lenna.quality(60) // set JPEG quality
    //     lenna.greyscale() // set greyscale
    //     let pixel = lenna.getPixelColour(100, 100);
    //     console.log(pixel);

    //     lenna.write('lena-small-bw.jpg'); // save

    // });


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

run();