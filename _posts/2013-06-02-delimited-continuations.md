---
layout: post
title: "Delimited Continuations(WIP)"
---
本文译自[这里。](http://jim-mcbeath.blogspot.in/2010/08/delimited-continuations.html)

注：翻译尚未完成，标记为WIP的章节还未开始。


####Delimited Continuations

Scala 2.8中引入的Delimited Continuation，可以被用来实现一些有趣的流程控制结构。


这是一篇很长很长的博客，我花了很长时间才理解了scala的`reset`和`shift`操作符，为了不让别人再掉进我遇到的坑里，我会从最基本概念开始介绍，如果你需要一个更短的介绍，请到文章的最后的“资源”部分查看其他的博客。


####目录

+ 技术实现
+ Continuation Passing Style
+ 嵌套CPS
+ 全部CPS和有界限的Continuations
+ 如何使用
+ CPS with Return
+ Reset和Shift
+ 注解(WIP)
+ 嵌套shift(WIP)
+ 控制结构的限制(WIP)
+ 建议(WIP)
+ 资源(WIP)


####技术实现
为了使用scala的*delimited continuations*，你的scala版本必须高于2.8版本（译者注：目前的scala的最新版本是2.10.2），并且你还需要使用scala的continuation编译器插件。你可以通过在命令行制定一个参数来在编译时(compiling)和运行时(runtime)启用此插件：

	scalac -P:continuations:enable ${sourcefiles}
	scala -P:continuations:enable ${classname}
在代码中，你还需要引入scala中对continuation的支持。

	import scala.util.continuations._

如何你忘记了引入上述包，你可能会得到类似下面的错误信息：

	<console>:6 error:not found value reset
			reset{		
			^
####Continuation Passing Style
为了理解scala的delimited continuations，首先你需要理解“continuation passing style”这个术语。

来看一下下面这段包含了方法调用的代码：

	def main{
		pre
		sub()
		post
	}
	
	def sub(){
		substuff
	}
`pre`和`post`表示在main方法中在调用sub方法之前、之后的代码，`substuff`表示sub方法中的所有代码。

当`sub`方法被调用时，系统会调度处理器执行sub中的代码，等sub中的代码执行完毕后，再继续执行main方法中其余代码。

我们可以把上面的代码进行些许重构，所有`pre`部分的代码可以被抽取到一个方法中，所有`post`部分的代码可以被抽取到另外一个方法中。甚至我们可以把每部分所需要的输入抽取为方法的参数，把每部分的的输出返回出来。经过以上修改，我们得到如下的代码：

	def main(m: M): Z = {
		val x: X = pre(m)
		val y: Y = sub(m, x)
		val z: Z = post(m, x, y)
		return z
	}
	
	def sub(m: M, x: X): Y {
		val y: Y = substuff(m, x)
		return y
	}

现在，让我们做点改进，我们不让系统在执行`sub`完毕后执行自动执行post，而是显式地把要执行的代码作为`sub`额外的一个参数传递给`sub`。然后我们修改`sub`，在完成原有的计算逻辑，计算出要返回给`main`的值`y`以后，调用这个额外的参数，计算出它的返回值`z`，然后把这个`z`返回给`main`。

	def main(m: M) {
		val x: X = pre(m)
		val z: Z = sub(m, x, {post(m, x, _)})
		return z
	}
	
	def sub(m: M, x: X, subCont: Y => Z) {
		val y: Y = substuff(m, x)
		val z: Z = subCont(y)
		return z
	}
当把包含`post`代码段传递给`sub`时，Scala生成一个记录了包含`post`执行上下文（当时的m，x值）的闭包，当这个闭包将来被执行时，可以获得的当时的执行上下文。

我们注意到，`main`方法中已无法看到`sub`方法原来的返回值`y`了，因此我们没法把`y`传递给`post`，我们用了一个占位符`_`来表示，这个值会在`sub`内部传递给`post`。我们可以把这个方法调用重写成一个更加明确的形式：

	val z: Z = sub(m, x, {y: Y => post(m, x, y)})
CPS的要点是“不要用`return`”。不像`direct style`那样调用一个子函数，待子函数执行完毕后返回给主函数，我们传递一个子函数执行结束后要被执行的continuation给子函数。

####嵌套CPS
在上面的例子里，我们已经迈出了变换成CPS的第一步。为了能够使用CPS的一些更高级的特性，我们需要继续完成上面的变换。

在方法调用的最顶层，`main`方法仍然有返回值，但是，在CPS中没有`return`，我们如何处理这种情况？答案是，最高层的方法不能有返回值，我们来再来增加一个顶级的wrapper：

	def prog(m: M) {
		val z: Z = main(m)
		println(z)
		System.exit(z.exitValue)		
	}
现在，我们可以对`prog`和`main`做同样的CPS变换：

	def prog(m: M) {
		main(m, {z: Z => {
			println(z)
			System.exit(z.exitValue)
		}})
	}
	
	def main(m: M, mainCont: Z => Unit): Unit = {
		val x: X = pre(m)
		val z: Z = sub(m, x, post(m, x, _))
		mainCont(z)
	}
我们仍然在`sub`中使用了`return`，并且在`main`中使用`sub`的返回值。为了解决这个问题，我们需要把`mainCont`做为一个`continuation`传递给`sub`，修改后的`main`和`sub`如下：

	def main(m: M, mainCont: Z => Unit): Unit = {
		val x: X = pre(m)
		sub(m, x, y: Y => {
			val z: Z = post(m, x, y)
			mainCont(z)
		})
	}
	
	def sub(m:M,x:X, subCont: (Y) => Unit) {
		val y:Y = substuff(m,x)
    	subCont(y)
	}

我们已经有了个自顶向下的continuation（包含了System.exit），因此，当我们执行在`sub`中执行`subCont`时，它会先执行`post`，再执行`main`后面的代码，即`println`和`System.exit`。

如果我们想把`stubstuff`也转换成CPS，我们需要利用同样的转换机制转换`sub`和`substuff`。把`sub`中`substuff`之后所有的代码做为一个额外的参数传递给`substuff`，其中包含了从`main`传递到`sub`的continuation，也包含了从`prog`传递到`main`的continuation。

我们可以看到，每个continuation都会包含它之前所有的caller的continuation，换句话说，每个continuation都包含了这个方法调用结束后需要被执行的所有代码。另外一个很重要的一点是，在每个调用CPS的子方法的地方，这CPS方法调用总是这个方法的最后一行。

####Full versus Delimited Continuations
在上面的讨论中，我们假设整个程序都被转换成CPS，这就是传统的CPS，我们也称之为Full Continutaitons。然而， 在原生不支持CPS的编程语言（例如scala）中使用CPS可能会使代码变得比较混乱， 因此如果能够把CPS的使用限定在特定的范围内是最好不过了。

这就是delimited continuation被发明出来的原因。仅仅留存部分后续要执行的程序，而不是尝试保存整个后续执行的程序。

我们再来看下上面的例子程序，那个`prog`方法与其他方法唯一的不同就是我们不能返回一个`Direct Style value`。如果我们移除掉那个`System.exit` ，我们可以在一个普通的`Direct Style`代码中调用`prog`，同时在`prog`和其子方法中使用CPS，每个方法以传递一个continuation给下一个方法结尾，直到最后一个continuaion被执行，CPS代码结束，控制返回到调用者`prog`中。

	def prog(m: M) {
		main(m, {z: Z => 
			println(z)
		})
	}

####Use

我们已经通过很大努力把我们的代码重写成CPS并且保持功能不变。现在我们再来看看如何修改代码只能使用CPS。

CPS的核心能力是：它能够提供一个显式的对象（continuation）来表示后续要执行的代码（或者，在Delimited continuation的情况下，后续要执行的部分代码）。在上面的例子中，我们在`sub`方的最后执行那个continuation。但是，如果我们不执行这个continuation，而是把它保存起来，例如一个singleton，会发生什么有意思的事情呢？

	object ContinuationSaver{
		var savedContinuation: Option[() => Unit] = None
		def save(saveCont: => Unit) = {savedContinuation = Some(saveCont _)}
	}
	
	def sub(m: M, x: X, subCont: Y => Unit) {
		val y: Y = substuff(m, x)
		ContinuationSaver.save {subCont(y)}
	}
`sub`保存了continuation后，`sub`就执行完毕，实际上整个delimited continuation已经执行完毕；控制已经返回到调用者`prog`中。但是在`ContinuationSaver`中我们仍然保存着那个记录着后续代码的continuation。实际上，我们已经把这些后续代码放到了挂起状态，并且在以后的任意时间重新执行。

我们不仅可以在将来执行这段代码，并且可以多次执行。我们甚至可以实现一个更加复杂的`ContinuationSaver`，能够保存多个`continuation`，并且记录哪个`continuation`应该被被执行，以什么样的顺序，执行多少次等。我们甚至可以把这些`continuation`持久化起来，或者发送到其他计算机上，如[Swarm](http://www.scala-lang.org/node/3485).

####CPS with Return

在纯粹的CPS中是没有return的，但是Scala中有return，甚至在使用CPS的时候。在上一章节中我用了“控制回到了调用者`prog`”这样的术语。这跟普通的方法调用一样 —— 所有的中间方法都返回到自己的调用者，直到方法调用栈pop到第一个CPS方法调用。我假设所有的CPS方法都不返回值（即返回`Unit`），但是没有任何规则规定我们不能从CPS方法中返回值。

If we add a return value to the transformed code, this is not something we can get as a result of using the above transformation technique. 

上面的例子展示了从一个`Direct Style`代码到CPS代码的转换过程，上述的转换方式总会生产一个返回值为`Unit`的代码。如果我们给上面转换后的代码加入返回值，通过上述的转换方式是做不到的。

如果给我们的CPS代码加入返回值，会发生什么样的事情呢？在上面的例子里， 子方法的最后一步总是在执行continuaiton，如果我们把这做为默认行为，当我们给CPS代码增加返回值时，这个返回值会沿着CPS方法调用链一直返回到最顶端的CPS方法，在Direct Style代码中表现为最顶端的CPS方法的返回值。当然，任何一个中间的CPS方法都有可能修改或者替换这个返回值。


举个例子，我们让最新版本的`sub`方法（把continuation保存在ContinuationSaver中的那个）返回一个Int值。

	object ContinuationSaver {
		var numberOfSavedContinuations = 0
		var savedContinuation: Option[() => Unit] = None
		def save(saveCont: => Unit): Int = {
			savedContinuation = Some(saveCont _)
			numberOfSavedContinuations = numberOfSavedContinuations + 1
			
			numberOfSavedContinuations
		}
	}
	
	def sub(m: M, x: X, subCont: Y => Unit):Int = {
		val y: Y = substuff(m, x)
		ContinuationSaver.save {subCont(y)}
	}
	
并且我们也修改了调用链的其他方法以便把这个值返回出去。由于对`sub`的调用是`main`方法的最后一条语句，我们只需要修改`main`的返回值类型使之和`sub`的返回值类型一致即可。同样地，对`main`的调用是`prog`方法的最后一条语句，只需习惯`prog`的返回值类型使之和`main`的返回值类型一致即可。

	def prog(m: M):Int = {
		main(m, { (z: Z) => 
			println(z)
		})
	}
	
	def main(m: M, mainCont: Z => Unit):Int => {
		val x: X = pre(m)
		sub(m, x, 
		{ (y: Y) => 
			{
				val z: Z = post(m, x, y)
				mainCont(z)
			}
		})
	}
如果我们想的话，我们可以在`main`中修改从`sub`中返回的值做为`main`自己的返回值，甚至我们可以从`main`中返回一个与`sub`的返回值没有任何关系的值。


我们来回顾一下上面转换后的CPS代码。我们可以发现，未转换的代码拥有原始的返回值类型，转换后的CPS代码有转换后（可能完全不同）的返回值。

####Reset and Shift
终于，我们有了足够的背景知识来理解Scala的 `reset` 和 `shift`关键字。

Scala中的delimited continuation是由EPFL的Tiark Rompf创建的。在他和Ingo Maier以及Martin Odersky合作的论文[Delimited Continuations in Scala](http://lamp.epfl.ch/~rompf/continuations-icfp09.pdf)有详细描述。下面的资源部分也有Tiark的关于Delimited Continuations的博客。

`reset`被用于标识delimited contiuation上界，只有`reset`内部代码才是CPS代码，`reset`的返回值不是CPS代码。

`shift`被用于标识delimited continuation的下界，`shift`内部的代码不是CPS代码，(but it's untransformed return value is CPS)但是它的未转换的返回值是CPS。当`shift`执行时，会被传入一个传入一个从它的调用者开始到一个闭合的`reset`的continuation做为参数。


所以，`reset`和`shift`是从Direct Style到CPS，从CPS带Direct Style的转换器。所有在`reset`和`shift`之间的代码都是CPS。所有包含了`shift`的方法需要被标识为CPS，所有调用CPS方法的方法也需要被标识为CPS，直到遇到一个闭合的`reset`。


当你使用`reset`和`shift`时，continuation编译器插件就是对你的代码做类似我们上面的例子里的CPS转换操作。从`shift`块结束处开始到方法结束或者reset块结束的代码会被打包成一个closure，做为一个continuation传递给`shift`块。


我们来仔细研究下Scala中`reset`和`shift`的例子。

	reset {
		shift{ k: (Int => Int) =>  k(7) } + 1
	}
	
`shift`语句告诉编译器插件重组代码，通过把从`shift`调用之后的代码转换成一个continuation，并且把这个continuation做为参数传递给`shift`语句。为了让这个例子更好懂一点，我们来做一下这个转换。

首先，我们把`shift`调用的结果赋值给一个变量，并且使用这个变量。

	reset {
		var r = shift{k: (Int => Int) => k(7)}
		r + 1
	}

接下来，我们把`shift`块之后的代码转换成一个函数，并且调用之。

	reset {
		var r = shift{k: (Int => Int) => k(7)}
		
		def f(x: Int) => x + 1
		f(r)
	}
这个函数`f`就是我们的continuation，它包含了从`shift`块结束到`reset`块结束的所有代码。

最后我们就像编译器插件那样，把我们的continuation函数f绑定到`shift`的参数`k`上。把转换后的代码的返回值做为`shfit`块的返回值。

	reset{
		def f(x: Int) = x + 1
		f(7)
	}

现在我们可以直接看到，返回值是8。

我们也可以把同样的转换方式应用到

	reset {
		shift { k: (Int=>Int) => k(k(k(7)))} + 1
	}
会得到

	reset {
	  def f(x:Int) = x + 1
	  f(f(f(7)))
	}
我们可以很容易地看出结果是10。

我们所有的转换都对`reset`外部的代码没有影响，例如

	reset {
	  shift { k: (Int=>Int) => k(7) } + 1
	} * 2
	
给reset表达式的返回值乘以2，结果会是16。

Tiark的论文中展示了一个有趣的例子：

	reset {
	  shift { k: (Int=>Int) => k(k(k(7))); "done" } + 1
	}
并指出这个代码的返回值是“done”。continuation函数被调用了三次，但是其返回值被抛弃了。对这段代码应用我们的代码转换过程，我们会得到下面的结果：

	reset {
	  def f(x:Int) = x + 1
	  f(f(f(7))); "done"
	}
从这个代码中很容易看出来为什么返回是“done”。

值得注意的一点是，`reset`块的运算结果**不像**大多数代码那样，是这个块的最后一行。实际上，`reset`块的运算结果是它内部的`shift`块的最后一行。执行`shift`块永远是`reset`块内部最后做的一件事。

当你看到一个`shift`块，并且它的返回值被应用在一个表达式中时，比如上面的那个“shift + 1”的例子，请记住一点，由于代码的转换，这个从`shift`块中“return”从来没有真正地**return**过。实际上，当执行到`shift`块时，`shfit`块之后的代码被转换成一个continuation并做为参数传递给这个`shift`块；如果`shift`块中的代码执行了这个continuation，这个continuation的执行结果就表现为`shfit`块的返回值。*the value which is passed as an argument to the continuation appears as the value being returned from the shift block.*因此，传递给`shift`块中continuation 函数的参数的类型和代码中`shfit`块的返回值类型是一致的。 continuation 函数的返回值类型和这个`shift`块外围的`reset`块的返回值类型是一致的*Thus the type of the argument passed to the shift block's continuation function is the same as the type of the return value of the shift in the source code, and the type of the return value of that continuation function is the same as the type of the return value of the original last value in the reset block that encloses the shift block.*

这里有三种类型与`shift`相关连：

+ 传递给continuation函数的参数类型，和shfit块的语义返回值类型一致。
+  *The type of the argument to pass to the continuation, which is the same as the syntactic return type of the shift in the source code.*

+ continuation函数的返回值类型，与从`shfit`块结束开始的代码的返回值类型一致。（例如，从`shift`块结束到函数结束或者`reset`块结束之间的代码的返回值类型）这被叫做`untransformaed return type`。

+ *The type of the return from the continuation, which is the same as the return type of all of the code that follows the 
shift block in the source code (i.e. the type of the last value in the block of code between the shift block and the end of the function or reset block containing the shift block). This is called the untransformed return type.*

+ `shift`块中最后一条语句的值，被做为整个函数或者`reset`块的返回值的类型。这个被称为`transformed return type`
+ The type of the last value in the shift block, which becomes the type of the return value of the enclosing function or return block. This is called the transformed return type.

在`shift`的方法签名中，上面的三个类型标记为`A`,`B`,`C`：

	def shift[A, B, C](func: ((A => B) => C)): A @scala.util.continuations.cpsParam[B, C]

`cpsParam`注解中两个类型为未转换的返回值和已转换的返回值。关于注解`cpsParam`在[下面](id:cps-anotation)有更详细的描述。


`reset`的方法签名包含了两个类型：第一个类型是传给`reset`的代码块的未转换类型，和`shift`的`B`类型匹配；第二个类型是该代码块的已转换类型，和`shfit`的`C`类型匹配。同时也是`reset`块的真正返回类型。`reset`的scaladoc中用`A`和`C`来表示这两种类型，但是这里我使用`B`和`C`，因此这个`ctx`参数类型和`shift`的返回类型一致。
	
	def reset[B, C](ctx: => B @scala.util.continuations.cpsParam[B, C]): C
	
下面展示了这些类型都是在哪儿出现的：

	C = reset{…; A = shift{k: A => B => …; C}…;B}

在下面这个例子里，`A=Int, B =String, C=Boolean`:

	def is123(n: Int): Boolean = {
		reset{
			shift{k: (Int => String) =>
			 (k(n) == "123")
			}.toString
		}
	}

####注解(WIP)
####嵌套shift(WIP)
####控制结构的限制(WIP)
####建议(WIP)
####资源(WIP)
