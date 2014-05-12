---
layout: post
title: "使用spring提高rails开发效率"
comments: true
---
###声明
目前spring只支持MRI 1.9.3, MRI 2.0.0, Rails 3.2，没有达到要求的人赶紧升级你们的ruby，rails版本吧


###问题
想必采用TDD/BDD方式进行开发的rails开发者都有着这样类似的经历：

1. pair写了一个测试
2. 运行测试
3. **等待**
4. 该我来编写产品代码
5. 运行测试
6. **等待**
7. 代码有bug
8. 测试失败
9. 修复测试
10. 运行测试
11. **等待**
12. 测试通过，yeah！


再回过头来想想，我享受这段pair的过程吗？

+ pair很给力，很快就把一个taks实现成一个测试用例
+ 桌子上的水果也很好吃。
+ 。。。

可是，我总觉得有点不爽快，原来是那么多的**等待**，每运行一次测试，就需要等待十几秒甚至几十秒，每天我会运行上千次测试，这是多大的浪费？做为一个有追求的程序员，我当然不愿意把宝贵的工作时间浪费在这无谓的**等待**中去 :-)。

###现有方案
有追求的程序员还是大多数，google之后才发现已经有人尝试解决这个问题，如[spork](https://github.com/sporkrb/spork)，[zeus](https://github.com/burke/zeus)。他们的原理都是预先把rails环境启动起来，后面在运行测试，执行rake task时从这个启动好的进程fork一个进程，在这个进程中执行操作。然而，spork需要修改spec_helper.rb，并且需要单独启动一个server进程，zeus虽然不需要修改项目代码但仍然需要单独启动一个server进程，用起来还不是很爽快。 [spring](https://github.com/jonleighton/spring)带来了更加易用的方案。

###安装
建议把spring安装到rvm的global gemset中去，这样就可以在多个project使用spring

安装命令非常简单：

	gem install spring

###使用	

执行测试的命令也非常简单：
	
	spring rspec

当第一次使用spring运行测试，rake taks， db migration时，spring会**自动**在后台load rails 环境，因此执行速度也很慢，但是当再次执行时，spring会从先前的进程中fork出load好的rails环境，执行速度就变得飞快！


###已知问题
把 `require 'rspec/autorun'`从spec_helper中删掉,否则，spec会被执行两次，而且第二次会由于找不到url helper method而失败。

	Failure/Error: visit posts_path
     NameError:
       undefined local variable or method `posts_path' for #<RSpec::Core::ExampleGroup::Nested_2:0x007fcf650718e0>
     # ./spec/integration/posts/posts_spec.rb:10:in `block (2 levels) in <top (required)>'
     # -e:1:in `<main>'
    
 感谢[Stefan Wienert](http://stefanwienert.net/blog/2013/02/08/faster-rails-tests-with-spring-faster-than-spork-und-easier-to-setup/)的分享。
 
###总结
spring把对项目代码的影响减少到了没有，并且能够去掉加载rails环境的时间，极大地提升rails开发者的效率，是现有rails开发者必不可少的利器。enjoy coding!!!
