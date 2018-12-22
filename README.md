#class_vision

opencv4nodejs 教程
https://www.npmjs.com/package/opencv4nodejs
https://www.youtube.com/watch?v=0hZoN4m7hP8

环境配置
安装opencv4nodejs仅需
·安装cmake并配置环境变量
.安装VS并添加C++编译
·安装git并配置环境变量
·npm install --global windows-build-tools
·npm install --save opencv4nodejs

脸部检测
node .\bin\main.js detect

脸部训练和对比（test目录需要添加对比图片）
node .\bin\main.js test