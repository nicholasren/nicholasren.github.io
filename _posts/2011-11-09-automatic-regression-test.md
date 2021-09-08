---
layout: post
title: 自动化回归测试
---
自动化回归测试

注：本文假设你对[Cucumber](http://cukes.info/ "cucumber")，[Selenium-WebDriver](http://seleniumhq.org/projects/webdriver/ "selenium")有一定的了解。

#### 什么是回归测试？
回归测试（regression test）是QA对程序功能问题的验证，通常我们的做法是:   
QA 手工测试 -> 报告bug -> Dev 修bug -> 提交到代码库 -> 构建程序包 -> 部署-> QA手工测试 -> 报告bug, 如此反复...

试想随着版本需求范围的增加，回归测试的测试用例也会如滚雪球般越积越多，在实施回归测试的过程中，因此，手工测试对于QA来说是重复的、乏味的。

让我们来看一下回归测试的定义：
> 回归测试是指修改了旧代码后，重新进行测试以确认修改没有引入新的错误或导致其他代码产生错误。   
> 回归测试的目的是，通过了回归测试的软件，至少其基本功能是可用的。   


#### 回归测试应该覆盖哪些内容？
从上面的定义，我们就可以识别出哪些测试用例需要被包括到回归测试中：   
   1. 与外部件集成的功能。   
   2. 主干功能。   
   3. 容易被break的测试。   

#### 自动化回归测试
既然测试范围已经确定了，接下来就要考虑如何减少这些重复的工作。我们很自然地想到了自动化。随之而来的问题是:   
   1. 我们如何实施自动化？   
   2. 我们的项目时间很紧，如何在不影响项目进度的前提下实现自动化的回归测试？   
   3. 对于web项目，如何保证其在各个浏览器下面都能够正常工作？   

对于第一、三个问题，有个成熟的方案，selenium-webdriver，其支持多种语言API, 包括Java,C#,Python,Perl,PHP,Ruby。也支持对多种浏览器的调用，可以模拟多种浏览器下对app的访问，并且支持对结果页面进行检查。
对于第二个问题，在经历过几次不是很成功的实践之后，我个人很反对对项目采用"休克疗法"，即完全停止目前的工作，采用另外一种看起来更好的方式来解决当前的问题，最具代表性的例子就是"打着重构的幌子进行重写"，在所谓的"重构"完成之前，项目其他成员的工作都是被阻塞住的，而且一旦"重构"失败，也难以恢复到"重构"前的状态。   

在这里，我推荐一种循序渐进的方式逐步实现回归测试的自动化。   
举个例子：
在确定了回归测试的范围后，我需要测试一个网上书店的从最新书籍列表进入书籍详情页面的功能，我们分别用普通的测试用例和DSL描述的用例：   

**普通的测试用例：**   
*预置条件*：   
数据库中有三本书，其信息如下：   
{% highlight sql %}
          ISBN          书名                       作者            价格 
         111111    Head First Design Pattern      Somebody         12
         222222    Test Driven Development       Kent Beck         22
         333333         Refactor                 Martin Fowler     20
{% endhighlight %}
*操作步骤：*   
   进入书籍列表页面，点击书籍"Head First Design Pattern"的链接   
*预期结果：*   
   进入书籍《Head First Design Pattern》详情页面，能够正确展示书籍名，价格，作者   

**使用Cucumber DSL描述的测试用例：**
{% highlight sql %}
    Given There are books as follows : 
        | ISBN   | 书名                      | 作者          | 价格 |
        | 111111 | Head First Design Pattern | Somebody      | 12   |
        | 222222 | Test Driven Development   | Kent Beck     | 22   |
        | 333333 | Refactor                  | Martin Fowler | 20   |
     And I am on the book list page
     And I follow "Head First Design Pattern"
     Then I should be on book detail page
     And I should see "Head First Design Pattern" as title
     And I should see "12" as price
     And I should see "somebody" as author</span>
{% endhighlight %}

#### 渐进式实现自动化回归测试
比较这两种形式的测试用例，我们排除语言实现的差异（中文和英文，而且Cucumber也是支持中文DSL的）， 它们的共同点是，都是人类可以理解的语言，任何一个QA都能够编写上述两种形式的测试用例。不同点在于，使用Cucumber DSL描述的测试用例可以在以后的某个时间点很容易地转换成自动化测试用例.   

于是，我们可以在项目中采取如下形式逐步把回归测试自动化：   
阶段一：
     确定回归测试覆盖功能点的范围，
     使用cucumber DSL描述测试用例
     手工执行这些用例
阶段二：
     利用项目间歇期，把这些使用cucumber DSL描述的测试用例转换成自动化测试。
     此时，项目中回归测试会存在自动化和手工测试两种形式，部分地节省了人力。
阶段三 : 
     所有的回归测试用例都被实现为自动化测试。
     这些测试都是可重复的，可以大大节省QA手工执行测试用例的时间。
     后期对回归测试用例的修改都相应地将其自动化。
就像重构一样，你可以在上面这三个阶段中的任何一个时刻停止，你也可以在停止之后继续。
如果你能够在你的项目里实践到阶段三，那么恭喜你，你们已经做到了让合适的人做合适的事情了。
