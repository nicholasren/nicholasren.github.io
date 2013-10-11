---
layout: post
title: "ruby代码是如何被执行的"
---

-------------not cleared-------------------
ruby解释器不会把ruby code转换成机器码

ruby解释器读取的是byte code，而非源代码（和JVM有点类似）

在运行时，（）把ruby source code编译成byte code

rubinius在尝试把ruby code编译成机器码，以获得更高的性能

-------------not cleared-------------------

###ruby object model   
在ruby中，class本身就是object，不同的是，class可以有instance（objects)，superclasses(parents)和subclasses(children),普通的objects是没有的

class的class是Class.

每个object都有(包括objects和classes)eigenclass

为什么会有eigenclass？
 有了eigenclass，可以达成以下两个目标:
 1. singleton method 有地方存放
 2. 类继承体系中，class method可被继承 


 ruby specification 是可执行的，
