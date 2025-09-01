---
layout: modern-post
title: "New Way To Solve Problem"
date: 2008-09-03
tags: [java, software-development, programming]
description: "A blog post about new way to solve problem and software development."
share: true
comments: true
---

恩，要常动脑筋

遇到这样一个需求：

```
A = 1时，B=1
A=2时:
  C(一个小时内的一个时间点)在00～29之间时、B=1。
  C在30～59之间时、B=2
A=3时:
  C在00～19之间时、B=1。
  C在20～39之间时、B=2。
  C在40～59之间时、B=3。
A=4时:
  C在00～14之间时、B=1。
  C在15～29之间时、B=2。
  C在30～44之间时、B=3。
  C在45～59之间时、B=4。
```
看起来一个稍复杂的需求，难道用`if else`或者`switch`? 
我周围真有人这么干的。再仔细观察下，用如下程序可以解决：

```java
int B= (C+1)/(60/A);
if((C+1)%(60/A) > 0){
  //对B取上界
  B++;
}
```
小聪明而已，写下这个只是想提醒下自己，在编程时"要用最少的代码最好地完成最多的事"
