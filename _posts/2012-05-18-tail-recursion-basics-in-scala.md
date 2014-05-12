---
layout: post
title: "Scala中的递归(译)"
comments: true
---
声明：本文翻译自<a href="http://oldfashionedsoftware.com/2008/09/27/tail-recursion-basics-in-scala/">这里</a>

###递归101   
  我们都知道什么是递归吧？一个自己调用自己的函数，或者函数A调用函数B，函数B又调用函数A，或者是A调用B，B调用C, C调用A。但是我们大多数情况下所说的递归函数，是指一个调用自身的函数。   
  在Java世界中，递归函数的曝光率很低，说起来有不少原因。   
  第一，递归不直观，难以理解。对于一段循环代码(for, while), 你可以很直白地看到这段逻辑的全景，即便你是一个初学者，而对于一段递归代码，就不是那么容易了，你只能看到递归逻辑的一次调用，而不得不想象当递归调用发生时，这些多次调用是如何组合在一起的。      
  第二，比起递归，循环在java中更加容易实现，比如for ，for-each，while， do-while, 数组, iterator, ResultSet，这些结构都是用来实现循环的。   
  第三，Java中的递归有自己的Achille's heel: call stack。   

  总的来说，当调用一个函数时，一个新的call stack frame会被放到call stack的顶部，用以保存局部变量，当前函数的caller，等等。但是，call stack的大小是有限的，当递归的深度不是很深时，调用递归函数是没有什么问题的，但是如果递归调用的深度无法预计，那么很有可能会导致stack overflow. 而循环却不会有这种问题(因为循环不会产生新的call stack frame),因此，使用循环更加安全。   
 
###Scala中的递归    
  Scala，作为一新兴的functional language，更偏爱递归胜过循环，那么在scala中，是如何解决call stack大小限制的问题的呢？我们来看一个例子：
{% highlight scala %}
  def listLength1(list: List[_]): Int = {
    if (list == Nil) 0
    else 1 + listLength1(list.tail)
  }

  var list1 = List(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
  var list2 = List(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
  1 to 15 foreach( x => list2 = list2 ++ list2 )

  println( listLength1( list1 ) )
  println( listLength1( list2 ) )
{% endhighlight %}   
函数listLenght1递归地计算list中item的数量，这个函数在计算item数量较少的list时工作地很好，然而在item数量很大时，就会得到stack overflow错误.
递归是函数式语言的谋生手段，但是在Scala中，递归仍然倒在了stack overflow的脚下。

先别急着放弃，Scala有一个很重要的优化递归的方案，只要你用了正确的递归类型。

###首递归和尾递归
根据递归调用的方式，递归可以分为首递归和尾递归。在首递归函数中，函数调用自身后，再进行其他运算（可能会把自用自身后的结果做为这些运算的输入）。在尾递归函数中，所有的计算都在函数调用自身前完成，调用自身是尾递归函数中做的最后一件事情。

这两种递归的区别的重要性目前看起来还不是那么明显,然而，它确实很重要！想象一下一个尾递归函数的执行过程，首先完成所有的计算，在最后一步，马上进行对自身递归的调用，一般情况下，这个时候就该使用call stack frame记录方法调用状态了，然而，这里却不需要：我们不需要记录局部变量，因为所有的计算都已经完成。我们也不需要知道目前在哪个函数中，因为我们始终在同一个函数中。基于以上前提，scala不会创建一个新的call stack frame，而是重用当前的call stack frame ，无论调用次数有多少，call stack也不会增长。这就是scala中尾递归函数的特殊性。在其他语言中，语言设计者通过把尾递归转换成循环的方式进行了优化。

而在首递归函数中，递归调用是不一样的，这是为什么呢？想象一下一个首递归函数的执行过程：先执行一些计算，在递归调用自身，然后在执行另一些计算。在调用自身前，需要记住当前的局部变量，以便在从递归调用返回后继续进行后面的运算，这样，就必须创建一个新的call stack frame来记录当前状态。因此首递归函数还是会有stack overflow的风险。并且无法被优化。   

在这里问你一个问题，上面的listLenght1是一个尾递归还是首递归？让我们来看着这个函数做了哪些事情。   
A) 检查参数是否为Nil。   
B) 如果为空，返回零，因为Nil的长度是零。   
C) 如果不为空，则返回1加上递归调用的结果。  
递归调用逻辑在这个函数的最后一行，应该是尾递归函数吧？错！在尾递归调用结束后，*然后*对递归调用结果加一，然后返回最终结果。这实际上首递归（或者可以叫做中递归）因为递归调用并不是所有运算的最后一步。  

###尾递归例子   
当你用scala写一个递归函数时，你的目标是写成尾递归以便编译器对尾递归进行优化。现在让我们把上面的那个函数重写为尾递归函数。   

{% highlight scala%}
def listLength2(list: List[_]): Int = {
  def listLength2Helper(list: List[_], len: Int): Int = {
    if (list == Nil) len
    else listLength2Helper(list.tail, len + 1)
  }
  listLength2Helper(list, 0)
}

println( listLength2( list1 ) )
println( listLength2( list2 ) )
{% endhighlight%}


我写成两个函数（listLength2 和一个内部的helper函数）以便和上面的例子中的函数接口保持一致。如果你能给listLength2Helper的参数给个默认值，我们就能只提供一个函数，但是我不知道怎么做。长话短说：listLength2只调用了做了实际工作的listLength2Helper，而且listLength2Helper也是个递归函数。   

listLength2Helper是个尾递归函数吗？递归调用是所有运算的最后一步，允许scala进行优化？就像listLenght1一样，listLength2首先检查参数是否为Nil，如果不是，就进行递归调用，但是仍然会有一个加一的操作 —— len + 1。难道这个就不是尾递归吗？不，len + 1 运算会在递归调用前运算。只有所有的参数运算完了以后，才会进行递归调用，这个函数确实是个尾递归函数。
