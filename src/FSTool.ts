import * as fs from 'fs';
import * as path from 'path';

export module FSTool {

    /**
     * 获取目录里的所有文件（异步方式，含错误检测）
     * @param directory 目录路径
     * @param fileType 文件类型（扩展名）
     * @param onComplete 完成回调方法
     * @param allPath 是否返回全路径
     * @param recursion 是否深层搜索
     * @param options fs.readdirSync 参数
     */
    export function GetFilesFromDirectory(directory: string, fileType: string = "*", onComplete: (files: string[]) => void, allPath: boolean = false, recursion: boolean = true, options?: string): void {
        let rtnFiles = [];
        let readDir = (subDir: string, onSubComplete: () => void) => {
            //根据文件路径读取文件，返回文件列表
            fs.readdir(subDir, (err, files) => {
                if (err) {
                    console.warn(err);
                    onSubComplete();
                    return;
                }
                let fileCount = 0;
                let checkCount = () => {
                    fileCount++;
                    if (fileCount >= files.length)
                        onSubComplete();
                }
                //遍历读取到的文件列表
                files.forEach(filename => {
                    if (fileType != "*")
                    {
                        let fileTypeArr = filename.split(".");
                        if (!fileTypeArr[1] || fileTypeArr[1] != fileType)
                            return;
                    }
                    //获取当前文件的绝对路径
                    let allPathFile = path.join(subDir, filename);
                    //根据文件路径获取文件信息，返回一个fs.Stats对象
                    fs.stat(allPathFile, (err, stats) => {
                        if (err) {
                            console.warn(err);
                            checkCount();
                            return;
                        }
                        if (stats.isFile())
                        {
                            rtnFiles.push(allPath ? path.join(subDir, filename) : filename);
                            checkCount();
                        }
                        else if (recursion && stats.isDirectory())
                        {
                            readDir(subDir, () => {
                                checkCount();
                            });//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    });
                });
            });
        }
        readDir(directory, () => {
            onComplete(rtnFiles);
        });
    }

    /**
     * 获取目录里的所有文件（同步方式）
     * @param directory 目录路径
     * @param fileType 文件类型（扩展名）
     * @param allPath 是否返回全路径
     * @param recursion 是否深层搜索
     * @param options fs.readdirSync 参数
     */
    export function GetFilesFromDirectorySync(directory: string, fileType: string = "*", allPath: boolean = false, recursion: boolean = true): string[]
    {
        let rtnFiles = [];
        let files = fs.readdirSync(directory) as string[];
        files.forEach(filename => {
            if (fileType != "*")
            {
                let fileTypeArr = filename.split(".");
                if (!fileTypeArr[1] || fileTypeArr[1] != fileType)
                    return;
            }
            let allPathFile = path.join(directory, filename);
            let stats = fs.statSync(allPathFile);
            if (stats.isFile())
            {
                rtnFiles.push(allPath ? path.join(directory, filename) : filename);
            }
            else if (recursion && stats.isDirectory())
            {
                rtnFiles = rtnFiles.concat(GetFilesFromDirectorySync(allPathFile, fileType, allPath, recursion));
            }
        });
        return rtnFiles;
    }

}