---
layout: modern-post
title: "Havent Write For 9 Days"
date: 2008-09-18
tags: [java, software-development, programming]
description: "A blog post about havent write for 9 days and software development."
share: true
comments: true
---

九天没有动笔了，总得写点什么吧

看了下上次博客发布的时间，9月9号，今天已经18号了。这几天一直在做一个模块，是对Ajax请求做响应的，后台的逻辑处理比较复杂，所以最近一直比较忙。
现在那个模块功能基本上已经完成了，写点东西来总结下。

### 先说前台：
以前从来没用过ajax，原理也比较简单，就是用javascript模拟一个http请求，然后从服务器返回的response中读取返回值并显示在某个DIV里。
现在的处理方式是在后台把数据的表示形式都拼好然后再通过response写回给浏览器。
觉得这种实现方式好丑陋，.java文件里一堆的html代码，应该有更好的方法，研究中。

### 再说后台： 
后台的逻辑是按照基本设计书的描述来做的，从一个过程化的描述分析出一个个的domain确实是个挺痛苦的事情，有时候好多对象都是被创建删除多次。在创建对象的过程中，我一直把尽量把逻辑放在与之紧密相关的对象中（难道这又是贫血模型的思想？），这样在后期调试的时候，出了bug能够很快定位到与之相关的代码，而且最大可能地重用了代码。

收到消息，下面又要进那个大的国际项目了，公司对这个项目比较重视，希望能够看到一个清晰的程序架构，能够从老员工学到一些东西。 抽空再看看《深入java虚拟机》，多了解下底层的东西，为自己增添些砝码。
