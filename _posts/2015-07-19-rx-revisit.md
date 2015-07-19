---
layout: post
title: "Rx revisit"
comments: true
---
### TLDR;
本文将简要介绍Rx中的多线程实现机制，另外会对其实现中的一个重要函数`lift`函数原理进行介绍。

###Rx
Rx实际上是一种高级版本的`Observer`模式，把被观察者封装成`Observable`（可理解为一个异步地生产元素的集合），
然后通过 `onNext`, `onError`, `onCompleted`注册`Observer`在相应场景下需要执行的__回调__。
值得一提的是，Rx为`Observable`提供了的`filter`,`map/flatMap`, `merge`, `reduce`等操作，使得对被观察者的操作就像同步集合那么便利。

###Worker
回调的实际执行者，底层由`java.util.concurrent.ExecutorService`执行实际的任务，同时扮演了`Subscription`的角色。

###Scheduler
Rx的默认行为是单线程的，它是一个`free-threaded` <sup>t1</sup>模型，意味着你可以自由选择一个线程来执行你指定的任务。
如果你创建Observable时没有引入`scheduler`,那么你注册的`onNext`, `onError`, `onCompleted`回调将被当前线程(即，创建Observable代码所在线程)上执行。
Scheduler提供一种机制，用于指定将会执行回调的线程。

#### Scheduler的多种实现：

- EventLoopsScheduler

  维护一组workers,当有新的任务加入`#schedule`时，通过`round-robin`的方式选取一个worker，将任务分配给其执行`Worer#scheduleActual`

- CachedThreadScheduler

  使用一个`ConcurrentLinkedQueue`缓存创建出来的线程以备后续任务使用，创建出来的线程有一定的有效期，超过有效期的线程会被自动清除。

- ExecutorScheduler

  包装了一个`Executor`的实例并，并基于它实现了`Scheduler`的接口。
  注意，在这个实现里，`thread-hopping(线程跳跃)`问题是不可避免的，因为`Scheduler`并不知晓其包装的`Executor`的线程行为。

- ImmediateScheduler

  立即在当前线程上执行任务。

- TrampolineScheduler

  把任务分配给当前线程，但并不立即执行，任务会被放到一个队列中等待当前任务执行完毕。


#### lift函数
在Observable的实现里，有个函数必须得提一下，`lift`。

Rx中巧妙提出一个`Operator`的这个函数类型，表述从一个`Subscriber` 到另一个 `Subscriber`的映射。

有大量对Observable的操作是通过定义`Operator` 并 `lift` 到`Observable`上实现的，如`Observable#all`, `Observable#filter`, `Observable#finallyDo`等等。

`Observable#lift`签名如下：

```scala
//inside Observable[T]
def lift[T, R](Operator[R, T]): Observable[R]
```

#####lift函数简介
有一定函数式编程基础的人相信对`lift`这个名字都不会太陌生。
`lift`顾名思义，把一个对简单类型操作的函数提升(`lift`)到复杂类型/容器类型上去。

我们来看一个对lift的定义:
```
有个两个类型 A, B
和一个函数 f: A => B
和一个容器 M[_]
lift 就是把f转换成一个新的函数 M[A] => M[B]
```

那么lift的定义如下:
```scala
 def lift[A, B, M[_]](f: A => B): M[A] => M[B]
```
跟上面看到的`Observable#lift`唯一不同的地方在于，这个`lift`函数的返回值是一个函数，
不过再仔细观察一下，这个`M[A] => M[B]`应用到一个`M[A]`实例后的效果和上面的`Observable#lift`是一样的。

听起来比较抽象，其实只要我们把上面的符号逐个替换成我们所熟知的类型，这个函数一点都不陌生：
我们来逐步应用如下替换法则:

- `A: String`
- `B: Int`
- `M: List[_]`
- `f: String => Int`

因此，`lift`就是
`(String => Int) => (List[String => List[Int])`

我们就暂且用 `(s: String) => s.length`做为我们的`f`吧，
假如有个字符串列表 `xs: List[String]`
那么 `lift(f)(xs)` 就会得到xs的中每个字符串的长度。
什么，这不就是 `xs.map(f)`的结果吗？是的，`map`函数就是一种常见的`lift`函数。


##### Observable#lift
我们再来看看`lift`在`Observable`中发挥了什么样的作用？

在开始之前大家需要记住这几个类型等式(`:=` 表示其左右两边的类型相等)：
- `Observable[_] := Subscriber[_] => Unit`
- `Operator[T, R] := Subscriber[R] => Subscriber[T]`


现在我们来做类型替换:
- `A: Subscriber[R]`
- `B: Subscriber[T]`
- `M: Observable[_]  (即 Subscriber[_] => Unit)`
- `f: Subscriber[R] => Subscriber[T]`

因此lift就是

```scala
(Subscriber[R] => Subscriber[T]) => (Subscriber[T] => Unit) => (Subscriber[R] => Unit)
```
亦即

```scala
(Subscriber[R] => Subscriber[T]) => (Observable[T] => Observable[R])
```
假如有个`ts: Observable[T]` 和一个函数`f: Subscriber[R] => Subscriber[T]`,通过`lift`函数，我们就能得到一个类型为 `Observable[R]`的结果。

---
_t1:_ 与`free-threaded`模型相对的是`single-threaded apartment`,意味着你必须通过一个指定的线程与系统交互。
