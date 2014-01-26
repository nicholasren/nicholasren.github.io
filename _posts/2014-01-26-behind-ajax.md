---
layout: post
title: "Behind AJAX"
---

相信大家对于下面这段代码都不会太陌生：


	doSomethingBefore();

	$.ajax({
	  url: "test.html",
	  success: function() {
		doSomethingWhenSucceed();
	  }
	});
	
	doSomethingAfter();
	


上述代码的执行顺序是：

1. 主程序首先调用`doSomethingBefore`
2. 其次，主程序发起ajax调用，接下来继续执行`doSomethingAfter`，主程序结束。
3. 待ajax请求得到响应并且响应成功时，`doSomethingWhenSucced`开始执行。

了解了javascript异步编程模型的人们这样的执行结果也不会觉得奇怪。那么，这段代码背后，到底发生了什么，我将在这里分享一下我的理解。


被jQuery惯坏了的程序员们或许已经忘记了使用原生的javascript api发起ajax调用了，我们先通过一个简单的例子回忆一下：

	var xmlhttp = new XMLHttpRequest();
	
	xmlhttp.onreadystatechange = function() {
	  if (xmlhttp.readyState === 4){
    	console.log(xmlhttp.responseText);
	  }
	};

	xmlhttp.open("GET","https://api.github.com/users/tater/events",true);
	xmlhttp.send();


[XMLHttpRequest](http://en.wikipedia.org/wiki/XMLHttpRequest)是ajax技术中最重要的一个概念，它是浏览器暴露给浏览器脚本语言(例如javascript)的一个接口，浏览器脚本语言(例如javascript)就可以通过这个API发起HTTP，HTTPS请求，并获取响应。

当我们需要发起一个ajax调用通常经过以下几步:

1. 创建一个XMLHttpRequest对象
2. 注册该XMLHttpRequest对象的`onreadystatechange`事件侦听器，即http请求成果后需要执行的动作。
3. 使用这个对象的`open`方法发起异步http调用
4. 浏览器发起http请求，并同时更新该XMLHttpRequest对象的`readyState`，触发`readystatechange`事件，（即此`readystatechange`事件进入javascript事件队列）。
5. javascript引擎线程轮询事件队列时，遇到`readystatechange`事件，调用该事件的侦听器函数，完成此次调用。

具体执行步骤参见下图：

![Ajax workflow](/images/ajax-steps.png "Ajax workflow")
上述步骤也体现了ajax如何在javascript单线程执行模型下工作的，关于javascript单线程执行的细节，
我的前同事四火最近写了一篇关于[javascript单线程执行的文章](http://www.raychase.net/1968)，详细介绍了javascript中单线程执行任务的原理。