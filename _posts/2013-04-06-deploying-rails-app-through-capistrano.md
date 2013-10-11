---
layout: post
title: "Deploying Rails App through Capistrano"
---
在这篇文章里，我将介绍如何使用capistrano部署rails应用。

####准备工作：
1. 创建一个用于部署的用户（eg. deployer）
2. 安装本地依赖:
3. 安装配置nginx: `yum install nginx`
	+ config nginx `ln -s /path/to/app/config/nginx.conf /etc/nginx/nginx.conf`
	+ restart nginx `service nginx restart`
	
####Capify
在工程根目录下执行：

	capify .
	
####配置ruby
我使用[capistrano-rbenv gem](https://github.com/yyuu/capistrano-rbenv)管理production环境的ruby版本，在Gemfile中增加如下一行：

	`gem 'capistrano-rbenv'`
	
然后在`config/deploy.rb`中增加如下两行：

	require 'capistrano-rbenv'
	set :rbenv_ruby_version, '2.0.0-p0'


####配置用于deploy的信息
在`config/deploy.rb`中配置capistrano所需要的信息：

	//...
	#配置目标服务器的地址，角色
	server '192.168.1.100', :web, :app, :db, :primary => true
	set 'application', "my-app"
	#代码库的地址
	set :repository, 'deployer@github.com:my-app.git'
	set :branch, 'master'
	set :scm, :git
	set :user_sudo, false
	#用于部署的用户
	set :user, 'deployer'
	#部署的目标目录
	set :deploy_to, "/home/#{user}/apps/#{application}"
	default_run_options[:pty] = true
	ssh_options[:forward_agent] = true
	//...

#####部署:
	
	cap deploy
