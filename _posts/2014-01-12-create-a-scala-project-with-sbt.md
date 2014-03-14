---
layout: post
title: "create a scala project with sbt"
---
在ruby的世界里，习惯了使用`bundle`来管理依赖，`Rake`来实现自动化构建，那么在scala的世界里，如果遇到一个好玩的开源库，例如akka，如何很快的把玩一下呢？以前我的做法会是：

+  打开InteliJ，创建一个scala项目
+  下载开源包到本地
+  写程序

有没有更便捷，轻量级一点的方式呢？答案是可以的，这里我就简单介绍一下使用sbt管理依赖，自动化构建scala程序。

+ 安装[sbt](http://www.scala-sbt.org/).
+ 安装sbt的[idea插件](https://github.com/mpeltonen/sbt-idea)
+ 创建一个工程目录
+ 在这个工程目录下新建一个名为`build.sbt`的文件，包含以下内容。 

{% highlight scala%}
name := "<your project name>"

version := "0.1"

scalaVersion := "2.11-M3"

libraryDependencies += "org.scalatest" % "scalatest_2.10" % "1.9.1" % "test"
{% endhighlight%}

这个文件中是scala语法，指定了项目名称，版本，依赖的scala的版本，以及项目所需要的依赖，例如我想要使用`akka`，那么就在该文件中加入以下内容


{% highlight scala%}
libraryDependencies += "com.typesafe.akka" % "akka-actor_2.11.0-M3" % "2.2.0"
{% endhighlight%}

+ 在工程目录下运行`sbt update`下载项目依赖包。
+ 运行`sbt gen-idea`生成idea工程文件。
+ 打开InteliJ导入刚刚生成的工程。

好，开始写scala程序吧。

由于我经常创建小的scala项目，于是写了一个[ruby程序来生成scala项目](https://gist.github.com/nicholasren/8384565)。



