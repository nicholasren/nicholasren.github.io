---
layout: modern-post
title: "Main Idea Functional Language"
date: 2011-01-26
tags: [scala, software-development, programming]
description: "A blog post about main idea functional language and software development."
share: true
comments: true
---

Main Idea of functional language

最近开始了解一种新的函数式+对象式语言scala，以后我会分篇在这里记下自己的心得。
本文主要内容摘自《Programing in scala 2nd Edition》。

Functional programming is guided by two main ideas:
The first idea isthat functions are first-class values.

In a functional language, You can
- pass functionsas arguments to other functions
- return them as results from functions
- store them in variables
- define a function inside anotherfunction

functions that are first-class values provide a convenient means for abstractingover operations and creating new control structures.

The second main idea of functional programming is that the operationsof a program should map input values to output values rather than change
data in place.

In other words, methods should not have any side effects.They should communicate
with their environment only by taking arguments and returning results.

A method without any side effects are called referentially transparent. Functional languages encourage immutable data structures and referentiallytransparent methods.
