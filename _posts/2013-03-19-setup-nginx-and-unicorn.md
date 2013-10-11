---
layout: post
title: "Setup nginx and unicorn"
---
本文简要介绍如何使用nginx和unicorn在ubuntu上搭建rails应用部署环境。

####前置条件
+ 部署用户 `deployer`
+ 程序已部署到`$HOME/apps/blog/current`下

####安装nginx
    apt-get install nginx
####安装unicorn
	gem install unicorn
####配置nginx  
   在工程目录下创建一个nginx的配置文件 - `$HOME/apps/blog/current/config/nginx.conf`，把nginx的根目录指向rails应用的静态文件目录下。
  
   		root /home/deployer/apps/blog/current/public;    
   		
   为upstream server（如unicorn，passenger）指定一个唯一的socket文件。

   		upstream app_server { 
   			server unix:/tmp/unicorn.blog.sock** fail_timeout=0; 
   		}
   创建一个从`$HOME/apps/blog/current/config/nginx.conf`到`/etc/nginx/nginx.conf`的soft link。

####配置unicorn
创建一个unicorn配置文件`$HOME/apps/blog/current/config/unicorn.rb`，配置unicorn使用同样的socket文件。

	listen "/tmp/unicorn.blog.sock", :backlog => 64
把working directory指向项目部署的路径。	

	APP_PATH="/home/deployer/apps/blog/"
	working_directory APP_PATH + "/current"
	
####启动nginx
	`/etc/init.d/nginx start`
	
####启动unicorn
	`cd $HOME/apps/blog/ && \
	 bundle exec unicorn -D -c $HOME/apps/blog/config/unicorn.rb -E production`