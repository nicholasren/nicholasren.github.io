---
layout: modern-post
title: "Getting Started With Vagrantmd"
date: 2012-05-13
tags: [software-development, programming]
description: "A blog post about getting started with vagrantmd and software development."
share: true
comments: true
---


### 什么是vagrant?   
  看<a =href="http://vagrantup.com/docs/getting-started/index.html">这里</a>
### 为什么要用vagrant？ 
  看<a =href="http://vagrantup.com/docs/getting-started/why.html">这里</a>

### 怎样开始使用vagrant？
1. 安装<a href="https://www.virtualbox.org/">VirtualBox</a>。
2. 安装基础虚拟机
{% highlight sh %}
$ vagrant box add base http://files.vagrantup.com/lucid32.box
{% endhighlight %}
这个基础虚拟机是一个运行着ubuntu，没有安装额外软件的虚拟机，以后的所有更改都是在这个基础虚拟机上进行的。

由于国内网络环境不好，推荐先把这个基础虚拟机镜像下载到本地，然后通过如下脚本安装：
{% highlight sh %}
$ vagrant box add base ./lucid32.box
{% endhighlight %}

然后运行如下命令初始化，启动虚拟机:
{% highlight sh %}
$ vagrant init base
$ vagrant up
{% endhighlight %}

至此，一个vagrant的基础虚拟机环境就创建成功了，想知道如何访问这个虚拟机？通过如下命令就可以登陆上虚拟机了。
{% highlight sh %}
$ vagrant ssh
{% endhighlight %}   

### 怎么配置虚拟机?
{% highlight sh %}
#创建一个目录用于存放配置虚拟机的文件
$ mkdir mybox 
#初始化这个新虚拟机
$ cd mybox 
$ vagrant box add mybox http://files.vagrantup.com/lucid32.box
$ vagrant init
{% endhighlight %}
经过以上步骤，在mybox目录下会多出一个文件Vagrantfile，这个就是配置虚拟机的文件, 在这个文件里，vagrant支持通过<a href="http://www.opscode.com/">chef</a>和<a href="http://puppetlabs.com/">puppet</a>对虚拟机进行配置。  

### 如何使用这个虚拟机？  
{% highlight sh %}
# 启动虚拟机
$ vagrant up
# 停止虚拟机
$ vagrant halt
# 登陆到虚拟机
$ vagrant ssh
# 删除虚拟机
$ vagrant destroy
# 把当前虚拟机打包成一个本地镜像，便于再次分发
$ vagrant package
{% endhighlight %}
