---
layout: post
title: "OOCamp 笔记"
---
#### OOCamp Day1 

  * Tasking
    做tasking的标准是，这个task具备可测试性
  * 封装
    对一个类的属性的读取，修改都在该类的上下文，那么这个类就没有封装泄露。
    tell, don't ask

#### OOCamp Day2 
  使用自定义对象而不是java原生对象，更加容易适应需求变化

#### OOCamp Day3 
   * 什么是重构？ 
     不改变功能的情况下改变代码的架构，重构的时候可以随时停止 
   * 如何识别bad smell？ 如果有一个子类，没有比父类更多的状态，那么这其实一个strategy模式 
   * 如何证明代码被改进了？ 把一个badsmell经过重构变成了一个pattern，或者bad smell消失了，那么代码就是被改进了。 
   * 什么是Pattern？ Pattern是一类问题及该类问题的解决方案。使用Pattern很容易，关键是正确地识别出问题，
     而问题一般都表现为一个bad smell。例如下面几个problem以及解决这些bad smell所使用pattern:   
     *class explosion* <b>Decorator</b>   
     *object creation is dependent on outside* <b>Factory</b> 

#### OOCamp Day4   
  重构   
   * 重构技巧：copy & paste => extract method & inline method   
   * 代码中，什么是其组成的最小单元？ 功能   
   * 要有足够的bad smell支撑你来做重构   
  
#### OOCamp Day5
   一个很难发现的bad smell: 上下文分散, Pattern:Strategy,把业务逻辑放到更加集中的类里
 

#### OOCamp Day6
架构:   
  * 什么是架构？   
   软件架构回答了以下两个问题：   
   1. 系统中有哪些组件   
   2. 组件之间如何交互   

  * 架构只有有了应用场景，才是有意义的

  * 五种常用的架构:   
     单体: Singleton，最简单的架构   
     黑板:模块之间的地位平等, 广播消息    
     分层:上层把下层当做抽象机器, 拒绝跨层. 大多数问题都可以通过引入一个分层来解决, 但这通常都会带来新的问题.    
     数据流:过滤器   
     微核:分成平台和核. 带来的问题是隐性知识增多,一个典型的例子就是spring.   

DRY:   
  DRY的代价是耦合, 绝大部分是值得的, 有些时候，需要故意引入重复来消除耦合.   
  DRY隐含了知识管理成本   
  note: 没有任何好的软件实践是不需要代价的.  

Mock:   
当我们提起Mock时，实际上在不同的上下文中，有着不同的含义。  
如果你想测试的代码依赖一个尚未实现的外部接口，你需要“mock”这个外部接口，让其按照约定的行为工作，
然后测试你的程序，这时候，“mock”是一种技术。如果你写了了一个实现了这个外部接口的‘mock’ class，在这个class中返回假的数据以支撑你的测试，这时候，“mock”是一种“mock framework”。

当然，在实际开发过程中，你一般不需要自行实现一个“mock framework”，有太多的mock framework供你选择, easymock，jmock, mockito等等。

几种常见的mock手段：   
fake, stub, dummy, mock

Q:什么时候决定了当前在用mock？   
A:call verify, 在此之前，都是在stub. 

State based testing:   
  内容实现不稳定时，采用基于状态的测试, 用stub即可。   
Interaction based testing:   
  在明确系统的行为边界时，需采用基于交互的测试，需要使用mock来验证代码的行为。   
