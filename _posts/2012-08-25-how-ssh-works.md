---
layout: modern-post
title: "How Ssh Works"
date: 2012-08-25
tags: [software-development, programming]
description: "A blog post about how ssh works and software development."
share: true
comments: true
---

How SSH works?

### 简介：
SSH，全名secure shell，其目的是用来从终端与远程机器交互，SSH设计之处初，遵循了如下原则：

  * 机器之间通讯的内容必须经过加密。
  * 加密过程中，通过 public key加密，private 解密。

### 密钥:
SSH通讯的双方各自持有一个公钥私钥对，公钥对对方是可见的，私钥仅持有者可见，你可以通过"ssh-keygen"生成自己的公私钥，默认情况下，公私钥的存放路径如下：    

  * 公钥：$HOME/.ssh/id_rsa.pub
  * 私钥：$HOME/.ssh/id_rsa

### 通讯原理：

  前提条件：

  1. 两个节点都持有各自的公钥私钥对，分别标记为PUBLIC KEY(client), PRIVATE KEY(client), PUBLIC KEY(server), PRIVATE KEY(server)
  2. 服务器上运行了SSH服务程序
   
建立通信通道的步骤如下：

  1. 客户端发起请求给服务器，服务器发回自己的public key给客户端
  2. 客户端检查这个public key是否在自己的$HOME/.ssh/known_hosts中，如果没有，客户端会提示是否要把这个public key加入到known_hosts中。
  3. 客户端会提示输入密码，用户输入密码后，客户端会使用PUBLIC KEY(server)对密码加密，然后发送给服务器。
  4. 服务器收到密码后，使用PRIVATE KEY(server) 解密，校验密码正确性. ??? 需要解密吗？
  5. 客户端把PUBLIC KEY(client), 发送给服务器。
  6. 至此，通讯通道建立完毕，当客户端想服务器发送消息时，会使用PUBLIC KEY(server)加密，服务器会使用PRIVATE KEY(server)解密，当服务器向客户端发送消息时，会使用PUBLIC KEY(client)加密，客户端收到数据后，会使用PRIVATE KEY(client)解密。

### 免密码登录：
我们的目标是: 用户已经在主机A上登录为a用户，现在需要以不输入密码的方式以用户b登录到主机B上。   
步骤如下：

  1. 以用户a登录到主机A上，生成一对公私钥。
  2. 把主机A的公钥复制到主机B的authorized_keys中，可能需要输入b@B的密码。

	    ssh-copy-id -i ~/.ssh/id_dsa.pub b@B
  3. 在a@A上以免密码方式登录到b@B

  		ssh b@B

### SSH forwarding:

	ssh -f user@ssh_host -L 1433:target_server:1433 -N
