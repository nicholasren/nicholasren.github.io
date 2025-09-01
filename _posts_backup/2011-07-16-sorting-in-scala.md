---
layout: post
title: Scala实现的各种排序算法
---
Scala实现的各种排序算法

收到TW的offer已经一周了，已经跟现在的公司提离职了，于是整个人都松弛下来了，闲来无事，把自己在学习scala期间写的几个排序的小例子拿出来分享一下：

## Insertion Sort:
{% highlight scala%}
def isort(xs: List[Int]): List[Int] = {
  xs match {
    case List() =&gt; List()
    case x :: xs1 =&gt; insert(x, isort(xs1))
  }
}
def insert(x: Int, xs: List[Int]): List[Int] = {
  xs match {
    case List() => List(x)
    case y :: ys => if (x <= y) x :: xs else y :: insert(x, ys)
  }
}
{% endhighlight %}

## 测试代码:
{% highlight scala%}
def main(args: Array[String])
{
  val xs = List(4, 6, 7, 3, 223, 999999, 6)
  print(isort(xs))
}
{% endhighlight %}

## Quick sort：
{% highlight scala%}
def quicksort[T](less: (T, T) => Boolean)(xs: List[T]):List[T]= xs match
{
  case List() => List()
  case y::ys => 
    quicksort(less)(ys.filter( a => less(a, y)))::: List(y) ::: quicksort(less)(ys.filter( b => !less(b, y)))
}
{% endhighlight %}
## 测试代码:
{% highlight scala%}
def main(args : Array[String])
{
  val xs = List(4, 5, 8, 1, 10);
  val sorted = quicksort((x: Int, y: Int) => x > y)(xs);
  print (sorted)
}
{% endhighlight %}

不知各位看完后是什么感觉？想想用C、Java语言实现一个insertion sort、 quick sort 的代码量吧，再看看这个scala实现，无需关注变量状态，只需要告诉编译器，先做什么，再做什么，其余的事情就由编译器自己实现了，
现在应该了解到函数式语言的威力了吧。个人感觉函数式语言更加接近人类的思维模式，想当年刚开始学习C++的时候，写个冒泡排序都把我憋出大红脸出来，后来接触到函数式语言才发现，原来编程是可以这么有趣，这么爽！
迷途的人们啊，赶快投入到函数式语言的怀抱中来吧 :)
