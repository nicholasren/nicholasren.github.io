---
layout: post
title: 浏览器是怎么工作的(1)
---
<p>声明：本文翻译自<a href="http://www.html5rocks.com/en/tutorials/internals/howbrowserswork/" target="_blank">How Browser Work</a>，我将会逐步发布所翻译的章节。</p>
<p class="p1">网页浏览器可以算得上世界使用范围最广的软件了，在这篇文章中，我将介绍下浏览器的内部工作机制。你将会理解从你在地址栏输入&ldquo;google.com&rdquo; 到你看到Google网站页面的这个期间究竟发生了什么。</p>
<p class="p2">&nbsp;</p>
<p class="p3"><strong>1. 简介</strong></p>
<p class="p1">1.1 浏览器</p>
<p class="p1">&nbsp; &nbsp; &nbsp;如今使用范围较广的浏览器有Internet Explorer，Firefox，Safari，Chrome和Opera。我将简单介绍几个开源浏览器&mdash;&mdash;Firefox，Chrome，Safari（部分开源）。根据StatCounter browser statistics，现在（2011/08）Firefox，Safari，Chrome在全世界市场占有率已经接近60%。所以开源浏览器是浏览器市场中一只不可小觑的力量。</p>
<p class="p2">&nbsp;</p>
<p class="p1">1.2 浏览器的主要功能</p>
<p class="p1">&nbsp; &nbsp; &nbsp;浏览器的主要功能是从web服务器上获取用户所请求的资源并展示在浏览器窗口中。在大多数情况下，用户所请求的资源是HTML文档，当然也可以是PDF，图片，音频等其他文件类型。资源的位置是采用URI（Uniform Resource Identifier）标识的。</p>
<p class="p1">&nbsp; &nbsp; &nbsp;浏览器解释、显示HTML文档的方式定义在HTML（<a href="http://www.w3.org/TR/REC-html40/"><span class="s1">http://www.w3.org/TR/REC-html40/</span></a>）、CSS（<a href="http://www.w3.org/TR/CSS/"><span class="s1">http://www.w3.org/TR/CSS/</span></a>）规范中。这些规范是由web标准化组织W3C维护的。</p>
<p class="p1">&nbsp; &nbsp; &nbsp;很多年前，很多浏览器开发商都只遵从了部分规范，并且发展出他们自己对标准的扩展，这导致了很多严重的兼容性问题。而现在，大部分浏览器都遵从了这些规范。</p>
<p class="p1">&nbsp; &nbsp; &nbsp;浏览器的用户界面大都类似，基本都包括了以下几个控件：</p>
<ul class="ul1">
<li class="li1">用于输入地址的地址栏</li>
<li class="li1">前进、返回按钮</li>
<li class="li1">加为书签功能选项</li>
<li class="li1">用于刷新、终止当前文档加载过程的按钮</li>
<li class="li1">用于返回主页面的按钮</li>
</ul>
<p class="p1">1.3 浏览器架构概述</p>
<p class="p1">&nbsp; &nbsp; &nbsp;浏览器的主要组件见下图(1.1)：</p>
<p class="p1">&nbsp; &nbsp; &nbsp;1. &nbsp;用户界面 - 包括地址栏，前进、后退按钮、加书签按钮等。包括了除了用于展示网页窗口的其他所有用户可以看见的部分。</p>
<p class="p1">&nbsp; &nbsp; &nbsp;2. &nbsp;浏览器引擎 - 配置UI和渲染引擎之间动作</p>
<p class="p1">&nbsp; &nbsp; &nbsp;3. &nbsp;渲染引擎 - 展示请求到的内容。例如，请求的资源是一个HTML文档，渲染引擎就会解析这个HTML文档和CSS并且把解析好的内容展示在网页窗口上。</p>
<p class="p1">&nbsp; &nbsp; &nbsp;4. &nbsp;Networking - 用于网络交互，例如HTTP 请求。它有一个独立于操作系统的接口，对于每个操作系统有不同实现。</p>
<p class="p1">&nbsp; &nbsp; &nbsp;5. &nbsp;用户界面后台 - 用于绘制一些基本的控件如下拉框，单选框等。它暴露了一组平台独立的接口，在底层调用了操作系统的用户界面方法进行绘制组件。</p>
<p class="p1">&nbsp; &nbsp; &nbsp;6. &nbsp;JavaScript引擎 - 用于解释执行javascript</p>
<p class="p1">&nbsp; &nbsp; &nbsp;7. &nbsp;数据存储 - 浏览器需要存储一些数据到本地磁盘上，例如cookie。新的HTML规范（HTML5）定义一个 web database ,提供一个嵌入浏览器中的完整的轻量级数据库。</p>
<p class="p1"><img src="http://filer.blogbus.com/4510111/4510111_1328453458g.jpg" border="0" alt="" /></p>
<p class="p1">&nbsp;</p>
<p class="p1">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 图 1： 浏览器主要组件图</p>
<p class="p2">&nbsp; &nbsp; &nbsp;值得注意的是，Chrome浏览器与其他浏览器不同，它为每个tab创建了一个独立的渲染引擎，每个tab是一个独立的进程。</p>
<p class="p3">&nbsp;</p>
<p class="p4"><strong>2. 渲染引擎</strong></p>
<p class="p4">&nbsp; &nbsp; &nbsp;渲染引擎的职责当然就是渲染了，具体点就是把获取到的内容展示到屏幕上。</p>
<p class="p4">&nbsp; &nbsp; &nbsp;一般情况下，渲染引擎可以展示HTML、XML和图片，当然，可以通过安装插件或者浏览器扩展展示其他类型的内容。如通过安装PDF查看器插件展示PDF文件。当然，在本章，我们还是关注最主要的功能：展示应用了CSS的HTML、图片。</p>
<p class="p5">&nbsp;</p>
<p class="p4">2.1 渲染引擎</p>
<p class="p4">&nbsp; &nbsp; &nbsp;Firefox、Chrome、Safari分别使用了两种渲染引擎。Firefox使用的是Gecko - 一个由Mozilla研发的渲染引擎。Safari和Chrome则都使用Webkit做为其渲染引擎。</p>
<p class="p4">&nbsp; &nbsp; &nbsp;Webkit最初是Linux上的开源渲染引擎，后来Apple对Webkit进行了修改使其支持Mac和Windows平台。更多详细信息请参见webkit.org。</p>
<p class="p5">&nbsp;</p>
<p class="p4">2.2 主流程</p>
<p class="p4">&nbsp; &nbsp; &nbsp;渲染引擎会首先调用<span class="s1">Networking</span>获取被请求的文档的内容。一般文档会被划分为8k大小的块进行传输。</p>
<p class="p4">&nbsp; &nbsp; &nbsp;在此之后，渲染引擎的处理流程如下：</p>
<p>&nbsp;</p>
<p class="p1"><img src="http://filer.blogbus.com/4510111/4510111_1328453458g.jpg" border="0" alt="" /></p>
<p class="p1">&nbsp;</p>
<p class="p1">&nbsp; &nbsp; &nbsp;图 2：渲染引擎主流程</p>
<p class="p1">&nbsp; &nbsp; &nbsp;首先，渲染引擎会解析HTML文档构建DOM树，把遇到的HTML标记转换成&ldquo;内容树&rdquo;上的DOM节点。同时它也会解析外部CSS文件和HTML文档中的样式数据，然后根据这些样式数据和&ldquo;内容树&rdquo;创建另一棵树-&ldquo;渲染树&rdquo;。</p>
<p class="p1">&nbsp;</p>
<p class="p1">&nbsp; &nbsp; &nbsp;渲染树包含一些带有颜色、大小信息的矩形，这些矩形按照其在屏幕上展示的顺序进行排列。</p>
<p class="p1">&nbsp;</p>
<p class="p1">&nbsp; &nbsp; &nbsp;渲染树构建完成后，将进入&ldquo;布局&rdquo;环节，在这个环节中会给每个节点设置其将被展示的位置坐标。接下来将进入&ldquo;显示&rdquo;环节 - 遍历整个渲染树，通过用户界面后台把各个节点展示在屏幕上。</p>
<p class="p1">&nbsp;</p>
<p class="p1">&nbsp; &nbsp; &nbsp;值得一提的是，这是个顺序的流程，为了获得更好的用户体验，渲染引擎会尽可能快地把内容显示在屏幕上。它不会等到所有的HTML文档解析完成才开始构建&ldquo;渲染树&rdquo;，当渲染引擎还在获取、解析其他内容时，已加载到的部分内容会先被展示在屏幕上。</p>
<p class="p1">&nbsp;</p>
<p>&nbsp;</p>
<p class="p1">&nbsp;</p>
<p>&nbsp;</p>
