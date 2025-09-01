---
layout: modern-post
title: "Thoughtworks 1 Month"
date: 2011-09-08
tags: [java, ruby, rails, software-development, programming]
description: "A blog post about thoughtworks 1 month and software development."
share: true
comments: true
---

ThoughtWorks入职一月

<p>
<p class="p1">&nbsp; &nbsp; &nbsp;在最近的两周里，和一个同事一起搭建一个持续交付的demo工程，到目前为止，已经基本接近尾声。不过，&nbsp;这个demo之前是根据一个ruby应用搭建的，但是考虑到国内目前的软件行业的现状，ruby仍然是一门小众语言，因此考虑通过一个java应用搭建一个CD Demo，这就是后面一周的工作重点啦。</p>
<p class="p2">成果：</p>
<ul class="ul1">
<li class="li1">设计了一个包含了Go master、Go agent、puppet master，target nodes， Dev Env演示环境的部署策略：</li>
</ul>
<ul class="ul1">
<li class="li1">使用shell编写了一个简陋的rails应用远程部署脚本。</li>
</ul>
<ul class="ul1">
<li class="li1">对于puppet有个基本的认识，使用puppet搭建了上述的环境的基础设施。</li>
</ul>
<p class="p1">收获：</p>
<p class="p1">&nbsp;&nbsp; 1) &nbsp;对bash 有个基础的了解，知道了interactive shell和non-interactive shell、登陆shell与非登陆shell之间的区别（他们启动的startup不一样）</p>
<p class="p1">&nbsp;&nbsp; 2) &nbsp;更加体会到了tasking的好处，尤其在考虑上述5个部件之间的交互关系时，采用这种方式能够帮助我理清思路，找出合理的解决办法。</p>
<p class="p1">&nbsp;&nbsp; 3) &nbsp;对于SSH有了基本的了解，知道了可以通过发布公钥在多个节点之间建立信任关系，用shell脚本实现了通过ssh远程登陆目标机器完成相应操作。</p>
<p class="p1">&nbsp;</p>
<p class="p1">计划：&nbsp;&nbsp;&nbsp;</p>
<ul class="ul1">
<li class="li1">了解<a href="http://www.openstack.org/" target="_blank">open stack</a>，目前仅知道这是一个开源的云计算平台软件集合</li>
<li class="li1">搭建一个open stack环境。</li>
<li class="li1">搭建一个java项目的持续构建、自动部署平台。</li>
</ul>
<p class="p1">遗留问题：</p>
<p class="p1">&nbsp;&nbsp;1) 对于rvm加载的机制尚不太清楚，需继续研究</p>
<p class="p1">&nbsp;&nbsp;2) 对于maven还是不够了解，需要继续学习，通过maven对该java demo项目进行构建</p>
</p>
