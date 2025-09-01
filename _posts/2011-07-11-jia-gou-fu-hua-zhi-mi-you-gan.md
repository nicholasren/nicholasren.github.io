---
layout: modern-post
title: "Jia Gou Fu Hua Zhi Mi You Gan"
date: 2011-07-11
tags: [spring, architecture, software-development, programming]
description: "A blog post about jia gou fu hua zhi mi you gan and software development."
share: true
comments: true
---

<p>看了陈金洲写的≪<a href="http://www.infoq.com/cn/articles/cjz-architecture-corruption" target="_blank">架构腐化之谜</a>≫，深有感触，这篇文章几乎精确地描绘了国内软件行业大多数公司的现状，我对于目前所在的一个项目从效率方面进行了分析，主要发现有以下几点问题：</p>
<p><span style="white-space:pre">	</span><strong>1 架构失控。</strong></p>
<p><span style="white-space:pre">		</span>到处充斥着代码泥团。
</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; <strong>2 功能杂糅。</strong></p>
<p><span style="white-space:pre">		</span>为了应对各种多变的需求，新增各式各样的开关配置项，代码中增加对这些配置项的判断逻辑，增加了代码的复杂度。
</p>
<p><span style="white-space:pre">	</span><strong>3 build, deploy 时间过长。</strong></p>
<p><span style="white-space:pre">		</span>目前我们构建一个发布包需要30分钟。</p>
<p><span style="white-space:pre">	</span><strong>4 启动时间过长。</strong></p>
<p><span style="white-space:pre">		</span>我测试了一下，在一台 CPU 为core dual 2.0GHz、 4G 内存的机器上，启动UT容器需要40~50秒，启动web容器需要4~5分钟。容器启动越慢，那么开发人员得到的反馈周期也越长，试想在一个几十个开发人员的项目组里出现这种情况，这是多大的浪费！</p>
<p><span style="white-space:pre">	</span>对于上面四个问题，我有些自己的想法想跟大家分享下：
</p>
<p><span style="white-space:pre">	</span><strong>1 实施code review。</strong></p>
<p><strong></strong><span style="white-space: pre;">		</span>开发过程中必须进行 code review,如果条件允许，可以尝试pair programming, 面对面的交流永远是知识传承的最佳方式。</p>
<p><span style="white-space: pre;">		</span>通过新老员工之间的code review 或者pair programming, 新员工可以以最快的速度了解项目内部一些约定：如，展示层的公共逻辑应该放在ViewCommon工程里；除了工具类，应该尽量避免静态方法调用；也可以尽快了解他应该写什么样的代码，写什么样的代码会挨批。</p>
<p><span style="white-space: pre;">		</span>只有所有人都去维护这个架构，遵守约定，那这个架构才能发展下去。好的架构不是设计出来的，而是演进出来的。</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<strong>2 有必要做这么大吗？</strong></p>
<p><strong></strong><span style="white-space: pre;">		</span>对于第二个问题，我有个疑问：我们做了那么多功能，客户现在用到了多少？做了功能然后又关掉，然后等后面客户要的时候再开启，那么在这个功能已经实现到这个功能被开启正式商用这段时间，这些代码的维护成本谁来承担？这些是不是浪费？</p>
<p><span style="white-space: pre;">		</span>即使客户的需求真的有这么多，他的商用计划是什么？是不是所有特性在这个版本发布时会全部上线？等考虑完这些问题，那么这些所谓的开关项，以及由这些开关项所控制的功能组合而成的大项目（这里的大指的是在物理部署上大）存在的必要性就值得怀疑了。我们不妨换个思路：把产生这个大项目的大需求划分开来，把大项目分解为几个可以独立部署、运行的小项目，然后分阶段实现这些项目，逐步提供给客户，这样的客户感知就是系统主页上不断新增的链接或者tab，而实际上这每个链接或者tab后面都是一个新部署上线的子系统。而这些子系统的开发、维护成本都肯定低于一群人在一个大项目里捣鼓。</p>
<p>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;<strong>3 精简build 脚本。</strong></p>
<p><strong></strong><span style="white-space: pre;">		</span>把构建任务中的每一步都独立成一个单独的target, 即能达到脚本重用的目的，又能让开发人员灵活选择自己想要运行的target ，另，目前我们的项目还是存在循环依赖的情形，这个问题必须解决。</p>
<p><span style="white-space: pre;">	</span>&nbsp;<strong>4</strong>&nbsp;<strong>这个问题有多种解决方案：</strong></p>
<p><strong><span style="white-space: pre;">		</span></strong>&nbsp;1）给开发人员换更好的机器
</p>
<p><span style="white-space: pre;">		</span>&nbsp;2）写UT来验证功能的正确性，而不是 </p>
<p><span style="white-space: pre;">		<span style="white-space: pre;">	</span></span>&ldquo;修改代码-＞重启容器-＞刷新页面-＞查看结果&rdquo;
这样一个反馈周期超长的流程。</p>
<p><span style="white-space: pre;">		</span>&nbsp;3）写UT用例尽量不要启动spring容器，实际上绝大多数应用逻辑不需要启动容器就可以进行测试。</p>
<p><span style="white-space: pre;">		</span>&nbsp; &nbsp; &nbsp;什么？你问我们那些公共能力怎么办？比如数据字典，比如配置项列表？我建议你用stub吧，这个可以节省很多时间，写个桩是值得的。</p>
