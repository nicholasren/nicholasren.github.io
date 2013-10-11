---
layout: post
title: Main Idea of functional language
---
<p>最近开始了解一种新的函数式+对象式语言&mdash;&mdash;scala，以后我会分篇在这里记下自己的心得。</p>
<p>本文主要内容摘自《Programing in scala &nbsp;2nd Edition》。</p>
<p>&nbsp;</p>
<p>Functional programming is guided by two main ideas:</p>
<p><em>The first idea is&nbsp;that functions are first-class values.</em></p>
<p> In a functional language,</p>
<p> You can</p>
<p><strong></strong></p>
<ul>
<li>pass functions&nbsp;as arguments to other functions</li>
<li>return them as results from functions</li>
<li>store them in variables</li>
<li>define a function inside another&nbsp;function</li>
<li><span style="white-space: pre;">define functions without giving them a name</span></li>
</ul>
<p>&nbsp;</p>
<p>functions that are first-class values provide a convenient means for abstracting&nbsp;over operations and creating new control structures.</p>
<p><em>The second main idea of functional programming is that</em></p>
<p><strong></strong><span style="white-space: pre;">	</span>the operations&nbsp;of a program should map input values to output values rather than change</p>
<p>data in place.&nbsp;In other words, &nbsp;methods should not have any <em>side effects</em>.&nbsp;They should communicate</p>
<p>with their environment only by taking arguments and returning results. a method without any <em>side effects </em>are called&nbsp;<span style="font-style: italic;">referentially transparent</span>.</p>
<p>Functional languages encourage immutable data structures and referentially&nbsp;transparent methods.</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p><span style="white-space: pre;"><br /></span></p>
<p>&nbsp;</p>
