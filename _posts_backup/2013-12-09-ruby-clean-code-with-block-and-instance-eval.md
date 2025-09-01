---
layout: post
title: "Ruby clean code之block and instance eval"
comments: true
---
Ruby clean code之block and instance eval

### 引子
自从来到ruby世界，我就被ruby那自由的语法、优雅的对象模型、漂亮的dsl深深地迷住了，了解更多的ruby特性，能够帮你实现更漂亮，流畅的api。在这篇文章中，我将以一个例子来演示如何使用ruby的block和instance_eval实现更具表现力的api。

### 需求
这个例子是一个来源于真实项目需求，为了演示方便，我对其做了一些简化。程序的输入是一个格式固定的json字符串，输出是从这个json中获取到一些属性值创建出来的一个给定类型的对象。然而，不同于以往的json和对象之间的序列化，反序列化，这里的从json字符串中的值与对象属性之间的对应关系有一定的逻辑。
json中的值和对象值对应关系有如下几种：

1. json属性和对象属性直接对应。
2. json属性和对象属性直接对应，当json中没有该属性时，使用给定默认值。
3. 对象的属性的类型不是普通类型，当json中有对应属性的值时，需要根据json中的值创建一个对应的类型对象。	
4. 等等

我们先来看下最初的实现版本：

注：这里的`json`不是一个字符串对象，而是经过`JSON.parse`处理后得到一个嵌套的hash，下同。
{% highlight ruby%}
class Post
  attr_accessor :author_name, :date, :tags

  def initialize(json)
    init_author_name(json)
    init_date(json)
    init_tags(json)
    #init_xxx...
  end
  
  # omit some code here...
  
  # json中的title和对应上面的第一种情形
  def init_author_name(json)
    @author_name = json['author']['name']
  end

  # 对应上面的第二种情形
  def init_date(json)
    @date = json['date'].blank? ? "1970-01-01" : json['date']
  end

  # 对应上面的第三种情形
  def init_tags(json)
    @tags = []
    unless json['tags'].nil?
      json['tags'].each do |tag|
        @tags.append(Tag.new(tag))
      end
    end
  end
end
{% endhighlight%}

### Bad smell
看到这样的代码，你发现什么bad smell了吗？重复代码？不像，但是那么多的`init_xxx`方法看起来就是有那么点不自然。

在我看来，这份代码有两个问题：

第一，从json到Post对象的转换职责，不应该是Post类的职责，这份代码违反了**单一职责原则**。

第二，由于无法很好地将json中的值和对象值对应关系规则建模，导致我们不得不创建多个`init_xxx`方法，然后在在`initialize`方法中逐一调用这些方法。然而在这些`init_xxx`方法之间，存在着**结构化重复**。

### 如何改进？
首先，要分离职责，把json到Post对象的转换职责放到一个新类`PostBuilder`中。

其次，要对对应关系进行抽象。

### 改进
我们在来分析一下json中的值和对象值对应关系规则，还是有规律可循的，对应关系都由三部分组成：*json属性*，*对象属性名*，*转换规则（默认没有转换规则）*。其中，通过[`jsonpath`](http://goessner.net/articles/JsonPath/)来标识*json属性*，通过block来表示*转换规则*， 我们可以建立一个`MapingRule`类来对此关系进行建模。


由此我们得到如下代码:
{% highlight ruby%}
class Post
  attr_accessor :title, :date, :tags
end

class MappingRule
  attr_accessor, :json_path, :attr_name, :converter

  def apply(obj, json)
    value = JSONPath.new(@json_path).on(json)
    unless value.nil?
      obj.send("#{@field_name}=", @converter.call(value))
    end
  end
end

class PostBuilder
  def initialize
    @rules = []
  end
  
  def rule(json_path, attr_name, converter)
    @rules << MappingRule.new(json_path, attr_name, converter)
  end
  
  def build json
      post = Post.new
      @rules.each do |rule|
      	rule.apply(post, json)
      end
  end
end

# 创建builder
builder = PostBuilder.new
buider.rule("author name", :author_name)
buider.rule("date", :date, -> (date) { date.nil? ? "1970-01-01" : date} )
buider.rule("tags", :tags, -> (tags) { tags.map {|tag| Tag.new(tag)} })

# 使用builder从json创建对象

post = buidler.build({"date" => "2013-09-10", "tags" => ["music", "IT"] })

{% endhighlight%}

### 回顾
与最初版本相比，我们引入了jsonpath和block来对转换规则进行建模（创建了MappingRule类），在PostBuilder#build中循环应用各个rule完成对象的创建，消除了多个`init_xxx`的重复。至此，代码已经达到一个令人满意的状态。然而，能否让我们的PostBuilder的接口更加漂亮些？

### 再改进，更具表达力的api
我们再来看下PostBuilder的使用场景：

1. 创建一个PostBuilder对象。
2. 给这个对象增加一些转换规则。
3. 使用这个对象从json创建对象。

因此，可以说，在一个PostBuilder对象被添加规则之前，它是不完整的，是不可用的，即第一二步应该是一个原子操作，我们可以把`initialize`变为private方法，增加一个`config`类方法，这个方法可以接受一个block，在此block中对builder增加规则，在这个方法中创建一个builder实例，同时把这个实例传递给block完成buidler的创建。代码如下：

{% highlight ruby%}

#增加一个config类方法
class PostBuilder
  def self.config
    builder = PostBuilder.new
	yield(builder) if block_given?
	builder
  end
  
  #...
  private
  def initialize
  #...
  end
end

#创建builder
builder = PostBuilder.config do |builder|
    buider.rule("author name", :author_name)
    buider.rule("date", :date, -> (date) { date.nil? ? "1970-01-01" : date} )
    buider.rule("tags", :tags, -> (tags) { tags.map {|tag| Tag.new(tag)} })
end

#使用builder
post = buidler.build({"date" => "2013-09-10", "tags" => ["music", "IT"] })
{% endhighlight%}


### 再改进，更简洁的api
至此，这个PostBuilder提供的api已经非常干净了，然而，这个api还是有改进空间的。在block中`builder`这个单词出现在每个增加规则的地方。有没有办法把这个重复也给消除掉呢？答案是可以的，[`instance_eval`](http://apidock.com/ruby/Object/instance_eval)隆重登场了。对`PostBuilder.config`方法做如下修改：

{% highlight ruby%}
  def self.config(&block)
    builder = PostBuilder.new
	builder.instance_eval(block)
	builder
  end
{% endhighlight%}

那么，创建builder的代码就简化为：
{% highlight ruby%}
builder = PostBuilder.config do
    rule("author name", :author_name)
    rule("date", :date, -> (date) { date.nil? ? "1970-01-01" : date} )
    rule("tags", :tags, -> (tags) { tags.map {|tag| Tag.new(tag)} })
end
{% endhighlight%}
在`PostBuilder.config`中使用`instance_eval`对block进行evaluate，相当于在新创建的builder上执行block中的代码，同样能达到对builder增加规则的效果。

使用instance_eval能够使代码变得更加简洁，然而随之而来的风险是，你也给了你的api调用者一个在这个新建对象上执行**任意代码**的机会。因此，在简洁性和风险之间，你需要做一个权衡。

### 再抽象
再回头看看PostBuilder，只需些许改动，我们就能从json创建**任意**类型的对象，于是我们得到一个`InstanceBuilder`类，如下：
{% highlight ruby%}

post_builder = InstaneBuilder.config do
    instane_class Post
    rule("author name", :author_name)
    rule("date", :date, -> (date) { date.nil? ? "1970-01-01" : date} )
    rule("tags", :tags, -> (tags) { tags.map {|tag| Tag.new(tag)} })
end
{% endhighlight%}

你可以试着实现一个这个`InstaneBuilder#instane_class`方法。

### 结语
通观上面的例子，我们通过使用ruby的block和instance_eval，把一个复杂丑陋的代码变得干净，层次清晰，同时，更加容易扩展。
在这里，我抛出自己对编写代码的一点想法，供各位参考：

1. 在开始编写实现代码前，先考虑一下如何提供一套干净的，更具表达力的api，让api调用者喜欢使用你的api（[sinatra](http://sinatrarb.com)做了一个很好的榜样）。
2. 恰当地使用block，instance_eval 能够很容易的构建一个internal dsl。


### Reference
想了解更多关于`block`，`instance_eval`, `internal dsl`可以参考如下两篇文章：

[How do I build DSLs with yield and instance_eval?](http://rubylearning.com/blog/2010/11/30/how-do-i-build-dsls-with-yield-and-instance_eval/)

[Creating a ruby dsl](http://yonkeltron.com/blog/2010/05/13/creating-a-ruby-dsl/)
