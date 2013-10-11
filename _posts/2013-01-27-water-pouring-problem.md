---
layout: post
title: "Water pouring problem的scala实现"
---
**Note:**  本文中的程序来自Martin Ordersky在www.coursea.org上所开设课程中的样例代码，文章主要目的是讲述我对此类问题解法及scala lazy evluation的理解。

###问题描述
给你一个容量为9升的杯子和一个容量为4升的杯子，水不限使用，要求精确得到6升水。这就是“倒水问题”。我这里会讲述一个试用scala穷举法实现的一个例子。

###建模
首先我们对这个问题进行建模。这个问题可以泛化为如下形式：

	两个容量固定的杯子，可选的动作有：  
    	+ 加满
		+ 倒空
		+ 从一个杯子倒入另一个杯子

	初始状态为两个杯子都空，结束状态为其中一个杯子中的水量为所期望的结果。
从上面的描述中我们可以得到如下几个概念**状态**，**动作**，**路径**。

**状态**用于表述各个杯子中当前的水量，**动作**用来改变各个杯子中水量，**路径**用于表示到达某一状态的动作序列。

####状态
我们可以用一个`Vector[Int]`来表述杯子的状态，下标为杯子编号，元素值为当前杯子中的水量，另外，我们还需要一个`Vector[Int]`表示杯子的容量，下标为杯子编号，元素值为杯子的容量。于是我们得到如下代码：  
{% highlight scala %}
	class Pouring(capacity: Vector[Int]) {
		//States
		val initialState = capacity map (x => 0)
	}	
{%endhighlight%}
`capacity`为杯子容量， `intialState`为问题初始状态。

####动作
由上可知，解决这个问题可以有三种动作, `Empty`, `Fill`, `Pour`，每个动作都会导致状态发生变化，于是我们得到如下代码：   

{% highlight scala %}
	//Moves
	trait Move { 
		def change(state: Vector[Int]): Vector[Int] 
	}
	
	case class Empty(glass: Int) extends Move {
		def change(state: Vector[Int]): Vector[Int] = state updated (glass, 0)
	}
	
	case class Fill(glass: Int) extends Move {
	    def change(state: Vector[Int]): Vector[Int] = state updated (glass, capacity(glass))
	}
	
	case class Pour(from: Int, to: Int) extends Move {
		def change(state: Vector[Int]): Vector[Int] = {
	      val amount = state(from) min (capacity(to) - state(to))
    	  state updated (from, state(from) - amount) updated (to, state(to) + amount)
	    }
	}
{%endhighlight%}
注意因为要考虑杯子的容量和杯子中剩余的水量，`Pour`中的`change`方法稍微复杂了些。

####路径
接下来到了最重要的路径部分了，路径是到达某一状态的动作序列，我们需要一个`List[Move]`表述动作序列，一个`Vector[Int]`表述结束状态。
还需要一个`extend`方法来扩展当前的动作序列，即在当前路径上，应用一个动作（Fill, Empty, Pour），得到一个新的路径。于是我们得到如下代码：  
	
{% highlight scala %}
	//Paths
	class Path(history: List[Move], val endState: Vector[Int]) {
    	def extend(move: Move) = new Path(move :: history, move change endState)
		override def toString = (history.reverse mkString " ") + " -->" + endState
	}
{%endhighlight%}
###算法
这里我们要采用的是**穷举法：**

穷举从初始状态出发所有可能的动作，以及可能达到的状态，再穷举从这些状态出发所有可能的动作以及可能达到的状态，如此反复，直到找到一个可能达到的状态满足期望，则到达这个状态所经历的所有动作组成的路径即为问题的解。

首先我们来穷举给定一组杯子可能的动作：
{% highlight scala %}
	val glasses = 0 until capacity.length
	val moves =
		(for (g <- glasses) yield Empty(g)) ++
		(for (g <- glasses) yield Fill(g)) ++
		(for (from <- glasses; to <- glasses if from != to) yield Pour(from, to))	
{%endhighlight%}
其次，在不进行任何动作时，动作列表为空，所达到的状态为初始状态，则：
{% highlight scala %}

	val initialPath = new Path(List(), initialState)

{%endhighlight%}
接下来到最关键的部分了，**穷举从初始状态出发的所有可能扩展出来的路径及其所达到的状态**，由于从任何状态开始穷举，都会得到一个一组路径，而不是一个，于是我们首先定义一个从给定一组路径，穷举其可能扩展出来的的路径的方法：  
{% highlight scala %}
	 def from(paths: Set[Path], explored: Set[Vector[Int]]): Stream[Set[Path]] = {
	    if (paths.isEmpty) Stream.empty
    	else {
			val more = for {
				path <- paths
				next <- moves map path.extend
				if !(explored contains next.endState)
			} yield next
      		paths #:: from(more, explored ++ (more.map(_.endState)))
        }
  	}
{%endhighlight%}
`paths`为此次穷举的初始路径集合, `explored`用于记录已经穷举过的状态，以避免找出多条达到相同状态的路径，此方法通过穷举初始路径集合，在各个路径上扩展所有的动作，去掉那些达到状态已经被穷举过的路径，得到一组新的路径。

那么，从初始路径出发，其可能扩展出来的路径极其可能达到的状态如下：  
{% highlight scala %}
	val pathSets = from(Set(initialPath), Set(initialState))
{%endhighlight%}
	
对于给定的目标水量，遍历上述穷举结果路径找出`endState`包含目标水量的路径，如下：  
{% highlight scala %}
	
	def solutions(target: Int): Stream[Path] = {
		for {
			pathSet <- pathSets
			path <- pathSet
			if path.endState contains target
    	} yield path
  	}
{%endhighlight%}

###总结
我们知道，穷举是一个无穷无尽的过程，上面的程序是如何运行的呢？其实是scala中强大的[lazy load]("http://en.wikipedia.org/wiki/Scala_(programming_language)#Lazy_.28non-strict.29_evaluation")发挥了作用。我们再来看`from`方法的返回值类型，是`Stream[Set[Path]]`, `Stream` 用于表述元素序列，它的一个重要特点是，只有需要使用到其中的某个元素时，程序才会去计算这个元素。于是，在程序运行时，scala并不会一下子把所有可能的路径都计算出来。对于`solutions`方法，也是一样。因此，scala只有在从`solutions`的计算结果中获取满足条件的路径时，pathSet才会穷举可能的路径，并且在找到满足条件的路径后，计算会立即结束，不会再列举其余的可能。

