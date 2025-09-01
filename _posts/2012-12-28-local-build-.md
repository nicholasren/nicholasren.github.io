---
layout: modern-post
title: "Local Build "
date: 2012-12-28
tags: [rails, software-development, programming]
description: "A blog post about local build  and software development."
share: true
comments: true
---



注：感谢我的同事新宇想出的这个点子，没有他的这个点子，也就没有这篇文章。

#### 引子
在开发过程中，你有没有碰到这样的场景：   
“功能完成，该提交代码了。”   
“Hold on，得先跑下local build。”，你的pair叫起来了。   
“啊，是啊”，你恍然大悟。敲下`bundle exec rake dev`。   
“local build一般至少得运行十分钟吧， 抽空看看邮件吧”。   
5分钟过去了，你回过神来，看看测试跑得怎么样了。  
啊，测试在第二分钟时就悄无声息地废了。白白浪费了3分钟时间。。。。   
“要是测试在废掉的时候能够提醒一下我就好了。”你心想。

**做为一名自诩动手能力很强的程序员，有什么理由不自己试一试呢？**

要达到上述目标，我们需要解决以下几个问题：

1. 如何判断local build是否成功？
2. 如何播放声音提示？

	
我们首先来看第一个问题，`bundle exec rake dev`实际上是在执行一个shell命令，如何判断一个shell命令是否执行成功，
google之，得知可以通过**退出状态码**(Exit Code)进行判断，**非零退出状态码**表示shell脚本执行失败。于是我们创建一个脚本`run_test.sh`,脚本内容如下：


{% highlight sh%}
	#!/bin/bash -e
	bundle exec rake dev
	if [ $? == 0 ]; then
		#TODO 播放成功声音
	else
		#TODO 播放失败声音
	fi
{% endhighlight%}

接下来我们来看第二个问题，Mac OSX自带了一个命令行工具`say`,可以把单词转换为语音输出，例如执行`say "Hello World"`，你就会听到Mac 说话了。
于是，我们的脚本就变成了：

{% highlight sh%}
	#!/bin/bash -e
	bundle exec rake dev
	if [ $? == 0 ]; then
		say "Good, build passed"
	else
		say "Boom, build failed"
	fi
{% endhighlight%}

俩问题都解决了，该伸个懒腰休息休息了吧。“Hold on”， 你的pair又说话了，“难道这么好用的功能，你只想用它来执行local build吗？能否让所有的rake task失败都有声音提示呢？” 。真是个难缠的pair。

不管怎样，第三个问题来了，如何使`run_test.sh`变得更加通用？ 把要被执行的命令做为参数传给这段脚本，然后在脚本中执行，恩，是个不错的选择。于是脚本变成如下的样子：
	
{% highlight sh%}
	#!/bin/bash -e
	$@
	if [ $? == 0 ]; then
		say "Good, build passed"
	else
		say "Boom, build failed"
	fi
{% endhighlight%}

执行`sh ./run_test.sh bundle exec rake dev`，当`bundle exec rake dev`执行成功时，你就可以听到悦耳的声音提示了。

还能再改进吗？每次都要敲这么长的命令，好烦啊。加个alias吧，编辑<RAILS_TOOS>/.rvmrc，加入如下alias：

{% highlight sh%}
	alias be="sh ./script/run_test.sh bundle exec"
{% endhighlight%}

下次只要执行`be rake dev`，你就可以可以放心地看邮件了，等着听声音提示吧。

#### 后记
mac也提供了另外一个命令行工具`afplay`，可以用来播放音频文件，我们选用了卡巴斯基那个惨绝人寰的杀猪声做为build失败提示音，够惊悚吧。下面是我的项目中这个脚本的最终版本。

{% highlight sh%}
	#!/bin/bash -e
	$@
	if [ $? == 0 ]; then
	  afplay fixture/success.wav
	else
	  afplay fixture/fail.wav
	fi
{% endhighlight%}

#### 想说的话
上面的故事是从今天我和同事pair的场景里抽象提炼出来的，从提出点子到最后实现也就用来个把小时，代码量很小，难度也不大，然而带给每个team member的好处却是显而易见的。让平日里的工作变得有趣的正是这些点子，以及实现它的过程，更大的乐趣是把它分享给更多的人。我们已经分享了，你呢？
