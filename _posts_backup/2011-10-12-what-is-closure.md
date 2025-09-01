---
layout: post
title: 什么是闭包？
---
<p><span style="color: #121c46; font-size: 12px; line-height: 18px;"><span style="font-family: Verdana, 宋体;">&nbsp; &nbsp; 所谓&ldquo;闭包&rdquo;，就是在构造函数体内定义另外的函数作为目标对象的方法函数，而这个对象的方法函数反过来引用外层函数体中的临时变量。这使得只要目标对象在生存期内始终能保持其方法，就能间接保持原构造函数体当时用到的临时变量值。尽管最开始的构造函数调用已经结束，临时变量的名称也都消失了，但在目标对象的方法内却始终能引用到该变量的值，而且该值只能通这种方法来访问。即使再次调用相同的构造函数，但只会生成新对象和方法，新的临时变量只是对应新的值，</span>
<strong><span style="font-family: mceinline;">和上次那次调用的是各自独立的</span>
</strong>
<span style="font-family: Verdana, 宋体;">。</span>
</span>
</p>
<p><span style="color: #121c46; font-size: 12px; line-height: 18px;"><span style="font-family: Verdana, 宋体;">&nbsp;分享了个关于closure的ppt在<a href="http://www.slideshare.net/nicholasren/closure-9843416" target="_blank">这里</a>
<br />
</span>
</span>
</p>
