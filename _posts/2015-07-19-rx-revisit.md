---
layout: post
title: "Rx revisit"
comments: true
---

### TLDR;
本文是[rx-java](http://nicholas.ren/2014/05/09/about-rx-java.html)的后续,
将简要介绍Rx的起源，其多线程实现机制，另外会对其实现中的一个重要函数`lift`函数原理进行介绍。

###Rx
Rx实际上是一种高级版本的`Observer`模式，把被观察者封装成`Observable`（可理解为一个异步地生产元素的集合），
然后通过 `onNext`, `onError`, `onCompleted`注册`Observer`在相应场景下需要执行的__回调__。
值得一提的是，Rx为`Observable`提供了的`filter`,`map/flatMap`, `merge`, `reduce`等操作，使得对被观察者的操作就像同步集合那么便利。


###起源

__注：__此部分参考了[这个slides](http://www.slideshare.net/InfoQ/functional-reactive-programming-in-the-netflix-api)

Netflix做为RxJava的主要贡献者，把Rx.Net移植到了JVM上，下面我们就通过一个架构演进来了解一下RxJava的起源。

Netflix做为知名的流媒体提供商，坐拥3300万用户，其峰值下行流量可占北美地区互联网流量的33%，API请求量达到20亿次/天，面对众多的接入设备和巨量的API请求量，
Netflix的工程师发现是时候重新架构他们的API了，之前他们的API架构如下：

<img src="/images/netflix-old-architecture.jpg"/>

为了减少API调用的延迟，工程师们决定转向粗粒度的API设计：

<img src="/images/netflix-coarse-api-architecture.jpg"/>

粗粒度API设计意味着业务逻辑向服务器端迁移，必将在服务器端出现并行执行，嵌套调用。

与此同时，我们希望API的提供者能够对外部隐藏其底层并发的实现，什么意思呢？

我们来看一个反面教材:

{% highlight java%}
public Bookmark getBookmark(Long userId)
{% endhighlight%}

如果某天，我们的程序员说，这个接口执行时间太长了，我不想阻塞调用此方法的线程，做为API提供者，你应该会立刻想到采用如下方案：

{% highlight java%}
public Future<Bookmark> getBookmark(Long userId)
{% endhighlight%}

把返回值类型修改为`Future<Bookmark>`，这样就不会阻塞API调用者的线程，同时在内部使用一个新的线程或者线程池执行业务逻辑。

又过了一段时间，我们的产品经理说，需求变了，我们希望能给一个用户关联多个`Bookmark`，你很开心地把接口修改成如下形式：

{% highlight java%}
public Future<List<Bookmark>> getBookmark(Long userId)
{% endhighlight%}

然后和你们对接的客户端程序员实在忍受不了三番五次的接口改动，提着刀过来找你了。


在被砍得奄奄一息之后，你终于问出了这个问题：

> 有没有一种数据结构能够表示一个或多个在未来可用的结果，并且仅在结果可用时把结果传递给客户程序，客户程序无需了解其内部的并发实现？

### 有！Observable来救场
我曾在[上篇博客](http://nicholas.ren/2014/05/09/about-rx-java.html)里提到Observable的定义，我们这里再回顾一下：
> Observable用于表示一个可被消费的数据集合（data provider），它的消费者无需知道数据的产生机制同步的还是异步的，它会在数据可用，出错，以及数据流结束时通知它的消费者

实际上，`Observable`和`Iterable`是一组__对偶的(dual)__的概念，它们都被用来表示多个元素的集合，不同之处在于：

- `Observable`中的元素可以是异步产生的，而`Iterable`中的所有元素在其被消费前必须可用。
- `Observable`是`push- based`，其可以在元素可用，出错，所有元素都被消费完成时通知他的消费者；而`Iterable`是`pull-based`，其消费者必须主动地轮询新元素，主动地捕获异常，主动地处理所有元素都被消费完成。


如果用`Observable`来改造上述API，那么我们的API就是下面这个样子：

{% highlight java%}
public Observable<Bookmark> getBookmark(Long userId)
{% endhighlight%}

那么无论是需要同步返回，异步返回，或者异步返回多个Bookmark，这个API都无需做任何变更，
API内部可以：

- 使用调用线程进行业务逻辑计算，在运算完成后通过`onNext`将结果传递给客户端（原生的阻塞式调用）。

<img src="/images/observable-blocking.png"/>

- 使用一个新线程，或者一个新的线程池进行业务逻辑计算，在运算完成后通过`onNext`将结果传递给客户端（满足了异步返回的需求）。

<img src="/images/observable-thread-pool.png"/>

- 使用多个新线程，或者一个新的线程池分别获取多个bookmark，在获得每个bookmark之后多次通过`onNext`将结果传递给客户端（满足了异步返回多值的需求）。

<img src="/images/observable-thread-pool-multi-threads.png"/>

如此大的变化，客户无需做任何改动，这就是Observable高超的抽象能力带来的好处。
这就是Rx带来的巨大好处，也是Netflix把它移植到JVM上的最大动力。




### 原理

既然`Observable`这么强大，那么我们不禁会问:

- 为什么`Observable`能够做到`push-based`？
- `Observable`是如何做到使用多种并发实现的？


对于第一个问题，`Observable`提供了`subscribe`方法供客户程序注册回调函数，之后`Observable`会自己进行运算并调用相应的回调函数，
这样看起来就像是`Observable`在向自己的客户程序`push`其运算结果。


对于第二个问题，Rx中有个非常重要的概念—— __Scheduler__，它是Rx提供的一种并发模型抽象，你可以在创建你的Observable时指定采用哪种并发模型，
下面我们来看下Scheduler是如何对并发模型进行抽象的。

###Scheduler
Rx的默认行为是单线程的，它是一个`free-threaded` <sup>t1</sup>模型，意味着你可以自由选择一个线程来执行你指定的任务。
如果你创建Observable时没有引入`scheduler`,那么你注册的`onNext`, `onError`, `onCompleted`回调将被当前线程(即，创建Observable代码所在线程)上执行。
Scheduler提供一种机制，用于指定将会执行回调的线程。

#### Scheduler的多种实现：

- EventLoopsScheduler

  维护一组workers,当有新的任务加入`#schedule`时，通过`round-robin`的方式选取一个worker，将任务分配给其执行`Worker#scheduleActual`

- CachedThreadScheduler

  使用一个`ConcurrentLinkedQueue`缓存创建出来的线程以备后续任务使用，创建出来的线程有一定的有效期，超过有效期的线程会被自动清除。

- ExecutorScheduler

  包装了一个`Executor`的实例并，并基于它实现了`Scheduler`的接口。
  注意，在这个实现里，`thread-hopping(线程跳跃)`问题是不可避免的，因为`Scheduler`并不知晓其包装的`Executor`的线程行为。

- ImmediateScheduler

  立即在当前线程上执行任务。

- TrampolineScheduler

  把任务分配给当前线程，但并不立即执行，任务会被放到一个队列中等待当前任务执行完毕。

###Worker
回调的实际执行者，底层由`java.util.concurrent.ExecutorService`执行实际的任务，同时扮演了`Subscription`的角色。

### 总结

笔者在学习Coursea上学习Principal of Reactive Programming时，注意到Erik Miller曾打趣地说，不要自己尝试去实现Observable，使用现有的库就好了。
本着强大的好奇心，笔者还是试着阅读了Rx.java的源代码，才意识到这个模型是多么的精巧，它给多线程编程带来了革命性的体验。如果你对Rx.java有兴趣，强烈推荐阅读其源码。


----
_Note:_ 这本应该重开一篇博客，然而，原谅笔者的懒惰吧

#### lift函数
在Observable的实现里，有个函数必须得提一下，`lift`。

Rx中巧妙提出一个`Operator`的这个函数类型，表述从一个`Subscriber` 到另一个 `Subscriber`的映射。

有大量对Observable的操作是通过定义`Operator` 并 `lift` 到`Observable`上实现的，如`Observable#all`, `Observable#filter`, `Observable#finallyDo`等等。

`Observable#lift`签名如下：

{% highlight scala%}
//inside Observable[T]
def lift[T, R](Operator[R, T]): Observable[R]
{% endhighlight%}

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

{% highlight scala%}
 def lift[A, B, M[_]](f: A => B): M[A] => M[B]
{% endhighlight%}

跟上面看到的`Observable#lift`唯一不同的地方在于，这个`lift`函数的返回值是一个函数，
不过再仔细观察一下，这个`M[A] => M[B]`应用到一个`M[A]`实例后的效果和上面的`Observable#lift`是一样的。

听起来比较抽象，其实只要我们把上面的符号逐个替换成我们所熟知的类型，这个函数一点都不陌生。
我们来逐步应用如下替换法则:

- `A: String`
- `B: Int`
- `M: List[_]`
- `f: String => Int`

因此，`lift`的类型签名如下：

`(String => Int) => (List[String => List[Int])`

我们就暂且用 `(s: String) => s.length`做为我们的`f`吧，

假如有个字符串列表 `xs: List[String]`，

那么 `lift(f)(xs)` 就会得到xs的中每个字符串的长度。

什么？

这不就是 `xs.map(f)`的结果吗？

是的，`map`函数就是一种常见的`lift`函数。


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

{% highlight scala%}
(Subscriber[R] => Subscriber[T]) => (Subscriber[T] => Unit) => (Subscriber[R] => Unit)
{% endhighlight%}
亦即

{% highlight scala%}
(Subscriber[R] => Subscriber[T]) => (Observable[T] => Observable[R])
{% endhighlight%}

假如有个`ts: Observable[T]` 和一个函数`f: Subscriber[R] => Subscriber[T]`,通过`lift`函数，我们就能得到一个类型为 `Observable[R]`的结果。

---
_t1:_ 与`free-threaded`模型相对的是`single-threaded apartment`,意味着你必须通过一个指定的线程与系统交互。
