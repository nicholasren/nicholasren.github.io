---
layout: modern-post
title: "How To Install Exuberant Ctags"
date: 2011-12-29
tags: [software-development, programming]
description: "A blog post about how to install exuberant ctags and software development."
share: true
comments: true
---

<p>1. 从http://ctags.sourceforge.net/ 下载最新版本的ctags文件，目前为ctags-5.9.tgz.</p>
<p>2. 解压缩 tar -xf ctags-5.8.tgz</p>
<p>3. 安装: cd ctags-x-x &amp;&amp; configure &amp;&amp; make &amp;&amp; make install</p>
<p>&nbsp; &nbsp; 这里需要注意一下，ctags默认会安装到/usr/local/bin/目录下，当你安装完毕后执行ctags命令，可能仍然执行的是Unix系统自带的那个ctags，而非你新安装的这个exuberant ctags，我的解决思路是，在 .bash_profile里创建一个名为 ectags的alias，指向我们新安装的这个exuberant ctags。</p>
<p>4. cd &lt;工程目录&gt;, &nbsp;ectags -R, 就会自动生成tag文件了。</p>
<p><span style="white-space: pre;">	</span></p>
<p>&nbsp;</p>
