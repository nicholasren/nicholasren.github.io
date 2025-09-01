---
layout: modern-post
title: "Prototype Based Inheritance"
date: 2012-02-12
tags: [java, ruby, software-development, programming]
description: "A blog post about prototype based inheritance and software development."
share: true
comments: true
---

prototype based 继承机制

与Java，C#，Ruby中"class-based"继承机制不同，javascript是一种"prototype-based"的继承机制。 关于prototype-based和class-based的区别，我想通过一个例子来描述下：   
你是一个陶艺师，我给你一个图纸，说："照着这个图纸的样子帮我做5个罐子"，于是你照着图纸上描述的形状，颜色，材质做出5个，这就是class-based 的模式   

我拿给你一个罐子，说："照着这个样子帮我做个罐子"，于是你参照这个罐子的形状，颜色，材质做出5个，你就是采用了prototype-based 的模式。   

#### class based OO
我们再来看一段class-based 面向对象语言的代码示例：   
{% highlight javascript%}
class Animal
  private String name
  public Animal(String name)
  {
  this.name = name;
  }
  public void run(){
    ...
  }
}
  class Wolf extends Animal
{
  public void hunt ()
  {
    ...
  }
}
{% endhighlight%}
class Wolf继承自class Animal拥有了run技能，并且扩展了自己的hunt技能。

#### prototype based OO
下面我们来看看一段prototype-based面向对象语言的代码示例:
{% highlight javascript%}
    function Animal(name)
    {
      this.name = name;
      this.run = function () {
        console.log(this.name + " is runing")
      }
    }

    function Wolf(name)
    {
      this.name = name;
      this.hunt = function () {
        console.log(this.name + " is hunting")
      }
    }
    //继承的魔法在这里显现
    Wolf.prototype = new Animal();
    var someone = new Animal("Some one");
    var wolf = new Wolf("Wolf");
    someone.run();
    wolf.run();
    wolf.hunt();
    //should got exception here
    someone.hunt();
{% endhighlight%}
在这里，把function Wolf的prototype设置为一个Animal的实例，当尝试调用wolf上的run方法时，由于Wolf中没有run方法，于是javascript解释器会查找Wolf的prototype（一个Animal的实例）是否有run方法，如果有，则调用此方法，如果没有，则尝试调用此实例的prototype上的run方法，如此持续下去，直到找到这个run方法或者到达继承顶部 - Object.prototype。这就是基于"prototype-chain"的继承机制。   
