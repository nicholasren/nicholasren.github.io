---
layout: post
title: 好的编程习惯
---
<p>&nbsp;</p>
<p class="p1">昨天<a href="dreamhead.blogbus.cm" target="_blank">郑大晔校</a>的主题是 &ldquo;如何养成好的编程习惯&rdquo;，只有养成好的编程习惯，当你在时间紧任务重的情况下仍然能够写出风格、质量良好的代码。</p>
<p class="p1">分组讨论后，每个小组都给出了自己认为好的编程实践，我把大家的想法总结了一下，并且根据这些实践的侧重点，分成如下五个方面：</p>
<p class="p1"><strong>任务规划：</strong> &nbsp;Tasking，TimeBox</p>
<p class="p1">&nbsp;&nbsp; &nbsp; 关于Tasking，有两个大家最关注的问题</p>
<p class="p1">&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&mdash;&mdash;如何确定tasking的粒度 ？</p>
<p class="p1">&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;结论：task的粒度是由开发者的能力确定的，</p>
<p class="p1">&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 基本的评判标准是：如果你能够用一个测试用例描述这个task即将实现的功能，那么这个task的粒度就是合适的。</p>
<p class="p1">&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &mdash;&mdash;如何划分task？</p>
<p class="p1">&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;结论：不需要一次性把所有task划分清楚，可以从最简单的task入手，在实现简单task的过程中，你会逐渐识别出新的task，</p>
<p class="p1">&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;把这些新的task加入task list中，待第一个task 完成后，再从task list中获取下一个task，如此持续下去直到所有需求都完成。</p>
<p class="p1">&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;推荐阅读<a href="http://book.douban.com/subject/1230036/" target="_blank">《Test Driven Development》</a>这本书，书中很好地演示了&ldquo;Tasking&rdquo;的实践。</p>
<p class="p1">&nbsp;&nbsp; &nbsp; 关于TimeBox，有同事推荐了一个比较有名的实践 tomato time，以15~30分钟为一个tomato time，有计划，有节奏地工作。</p>
<p class="p1"><strong>软件设计： </strong>&nbsp;简单设计，先实现再重构，小步前进</p>
<p class="p1">&nbsp;&nbsp; &nbsp; 简单设计： 在软件设计上，一个程序员最容易犯两个错误&mdash;&mdash;<strong>没有设计</strong>和<strong>过度设计，</strong>两个极端。</p>
<p class="p1">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 对于一个刚入行的程序员，他/她最容易犯的错误是<strong>没有设计，</strong>比如，在一个类、一个方法内完成所有的功能。</p>
<p class="p1">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 对于一个刚入行并且阅读过设计模式相关书籍的程序员，他/她很容易犯一个错误&mdash;&mdash;<strong>过度设计</strong>。比起没有设计，程序员更加难以意识到自己已经过度设计了。关于过度设计我有个深刻的体会，这里拿出来跟大家分享一下：</p>
<p class="p1">&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;在某个产品中，为了实现一个从远程部件获取数据，我想当然地为了提高效率，对从远端获取的数据进行了缓存，并且，为了进一步提高效率，在程序内部多个地方做了数据缓存，这种设计导致的问题是，在程序发布之后，当发现获取的数据是错误的时候，花了大量时间来定位错误的数据出现在了哪个环节。痛定思痛之后，我移除了这些缓存，把处理这些业务数据的spring bean改成无状态的，这样业务逻辑大大 &nbsp; &nbsp; 简化，而且也没有发现性能低下的问题。 由此看来，这些缓存就是过度设计的思想引入的。</p>
<p class="p2">&nbsp;</p>
<p class="p1">&nbsp;&nbsp; &nbsp; 先实现在重构：这个行为就是建立在简单设计的理念上的，其目的就是为了避免过度设计，完成刚刚好的功能。</p>
<p class="p1"><strong>效率提升： </strong>&nbsp;熟练使用类库，熟悉IDE快捷键</p>
<p class="p1">&nbsp;&nbsp; &nbsp; 关于这两点，只有通过自己的实践慢慢积累，熟能生巧啦。</p>
<p class="p1">&nbsp;</p>
<p class="p1"><strong>工程实践：</strong> &nbsp;频繁提交， push前完成本地构建 ， &nbsp;和pair及时沟通 &nbsp;</p>
<p class="p1">&nbsp;&nbsp; &nbsp; 频繁提交：频繁提交的目的在于及时地把自己开发出来的代码提交到代码仓库上去进行持续集成，验证自己的代码是否破坏了原有的功能。其本质思想在于快速得到反馈。</p>
<p class="p2">&nbsp;</p>
<p class="p1">&nbsp;&nbsp; &nbsp; push代码到代码仓库前完成本地构建：这个工程实践的目的在于，提前发现可能引入持续集成失败的问题，降低修复持续集成失败的成本。</p>
<p class="p1">&nbsp;&nbsp; &nbsp; 和pair及时沟通：在ThoughtWorks工作，大家都是以pair的形式进行的，这个实践的目的在于，及时从pair处得到反馈并获得成长。</p>
<p class="p2">&nbsp;</p>
<p class="p1"><strong>代码风格：</strong> &nbsp;代码要是自注释的，格式规范， 不提倡（switch, if else, 深度嵌套, 大函数，重复）</p>
<p class="p1">&nbsp;&nbsp; &nbsp; 关于代码风格方面，大家的观点基本是一致的：代码是给机器写的，但是是给人看的，所以要写人类能够看得懂的代码。</p>
<p>&nbsp;</p>
