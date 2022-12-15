# **使用指南**

这里主要讲解一下项目结构以及如何使用

## 项目构成

本目录下两个文件夹，src为编写的web端应用，android为cordova打包生成的对应安卓手机端应用，night.wav为一个音频文件，便于测试。

## 如何使用？

共有3种使用方式，建议选择src目录下的web端使用，web端系统相对功能比较完全，bug也比较少：

1.网页web端使用 ：直接点击src/index.html运行即可，src/index.html是项目的首页。由于设计的应用是准备在手机端上部署的，故界面大小设置为手机大小375*812，可能与电脑浏览器大小不符，可以在电脑浏览器中设置页面比例。

2.android studio运行：打开android文件夹，在android studio虚拟机上运行。

3.手机下载：cordova生成了一个android apk文件，路径在android/app/build/outputs/apk/debug/app-debug.apk，在安卓机上安装运行。

# 小组成员

何梦杰（GentleWhisperQAQ）

常梦成（CMCgithub）

徐海林（xuhi0）