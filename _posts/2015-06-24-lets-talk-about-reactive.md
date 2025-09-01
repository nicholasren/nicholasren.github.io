---
layout: modern-post
title: "Lets Talk About Reactive"
date: 2015-06-24
tags: [java, scala, ruby, architecture, software-development, programming]
description: "A blog post about lets talk about reactive and software development."
share: true
comments: true
---

也谈响应式编程

### 太长不读；
本文将会围绕reactive extension介绍reactive programming的起源，其要解决的问题。


### 编程范式的演进
最近几年，`reactive programming`这个词语的热度迅速提升，下面的 google trends的这个图表很能说明问题。

<img src="/images/rp-trends.png"/>

自从高级编程语言被发明以来，各种编程范式的编程语言层出不穷，命令式编程（如C）
面向对象编程（如Java，Ruby），函数式编程（如Clojure, Scala，Haskell）都曾经或者正在软件开发领域占有一席之地。


### 面向对象编程
上世纪九十年代前，命令式编程仍然在软件开发领域占有主导地位。随着软件规模的不断增大，面向对象编程以其封装性，可重用性受到开发者和组织的青睐。


### 进入多核时代
随着[摩尔定律](http://baike.baidu.com/view/17904.htm)的失效，单核CPU的计算能力几乎达到了极限，CPU进入了多核时代，程序员转而通过并发编程，分布式系统来应对越来越复杂的计算任务。

然而并发编程并不是银弹，做为一种基于共享内存的并发编程，多线程编程有常见的[死锁](https://en.wikipedia.org/wiki/Deadlock)，[线程饥饿](https://en.wikipedia.org/wiki/Starvation_(computer_science))，[race condition](https://en.wikipedia.org/wiki/Race_condition)等问题，而且多线程bug的以其难以重现定位臭名昭著。

### 函数式编程的兴起
近年来逐渐火爆的**functional programming**以其提倡的:

- 函数是编程语言的一等公民(function as first-class citizen)
- 不可变量(immutable variable)
- 无副作用的函数(no side-effect/reference transparency)
- 可组合的函数(composable functions)

顺利地解决了因可变量**mutabble variable**被多个线程共享，修改等而导致可能的多线程的bug。

### 并发编程的痛点仍然存在
然而，`functional programming`就是现代的完美编程范式了么？远远不是。

即使使用了`functional programming`， 程序员总会需要处理异步任务或者事件，并且总有一些IO或者计算密集型的任务，这些任务可能还会阻塞其他活动线程，而且，处理异常，失败，线程任务之间的同步都比较困难而且容易出错。程序员需要不断地询问一个线程的运算结果（在Java中以`Future<T>`表示，`T`表示运算结果的类型）是否可用。我们来考虑一下下面两个例子：

有三个线程`t1`, `t2`, `t3`，他们的运算结果分别为`f1`, `f2`, `f3`。
有一个线程`t4`依赖于这三个线程的运行结果，而且每个线程都有有可能执行失败。
我们该如何编写线程`t4`的代码？

GUI程序中一次拖动操作中光标的位置就可被表示为`Future<List<Position>>`, (使用`Future`是因为这些`Position`的值是在未来的时间点生成的)。

如果我们希望在第一个`Position`可用时(拖动时间的开始位置)就能够在这`Position`所对应的位置画点，而不是等所有的`Position`都可用是一次性把光标的运行轨迹画出来。即我们希望程序能够尽快对输入进行响应。

即程序要及时，非阻塞地对输入响应。

上面的两个例子就是reactive programming尝试解决的问题，而Reactive Extension做为这个问题的答案，应运而生了。

#### Reactive Extension
Reactive Extension 这个概念最早出现在`.net`社区的[Rx.net](https://msdn.microsoft.com/en-us/data/gg577609.aspx)，一个提供处理异步事件的程序库，其核心概念是`Observable`，表示有限或者无限多个现在或者将来到达的事件。`Observable`提供了`onNext`，`onError`， `onCompleted`供开发者定制新元素到达，出现错误，或者流结束时的程序的行为。
并提供了`List`上类似的操作，如`map`，`filter`，`reduce`，大大降低了异步事件编程的复杂度。

因为这些概念是如此的强大，以至于很多编程语言，如`java`，`ruby`，`javascript`很快就有了各自的`reactvie extension`。

关于reactive extension的技术细节可以在[我的这篇博客](http://nicholas.ren/2014/05/09/about-rx-java.html)里找到。[这个视频](https://vimeo.com/120994663)详细地介绍了为什么需要reactive extension，以及reactive extension的是如何被发明出来的。


#### Reactive Manifesto
Wikipedia上对reactive programming解释如下：

> reactive programming is a programming paradigm oriented around data flows and the propagation of change.

举个例子，在命令式编程下，表达式`a = b + c`,`a`的值在这个表达式执行完毕之后就是确定的，即使`b`，`c`的值发生变化，`a`的值也不会改变。然而在响应式编程的语境下，`a`的值与`b`，`c`的值是绑定的，上述表达式其实建立的是`a`与`b`，`c`之间的一种依赖，`a`的值会随`b`和`c`的变化而变化。

我们称之为能够响应输入变化的 __事件(event)__。

然而现在来看，上述定义已经不能囊括reactive programming的含义了。随着软件系统的[非功能需求](http://www.infoq.com/cn/articles/non-functional-requirements-in-architectural-decision-making)要求越来越高，reactive已不仅局限于响应 __事件(event)__的传递，也表示程序能够响应 __负载(load)__，系统运行时出现的 __错误(failure)__。

发布于2014年9月份的[Reactive Manifesto](http://www.reactivemanifesto.org/)以宣言的形式提供了能够满足这些需求的软件系统架构设计的指导原则。

#### Reactive Architecture
在笔者看来，reactive programming可以从语言和架构两种层面上来理解，
近年来层出不穷的各种语言的 __reactive extention__ 就是语言层面的代表，而在架构层面上，也有遵循了reactive manifesto的类库（如akka）出现，笔者暂且称之为 __reactive architecture__。
在后续的文章中，笔者将会带着大家理解一个 __reactive architecture__ 是如何做到reactive的。
