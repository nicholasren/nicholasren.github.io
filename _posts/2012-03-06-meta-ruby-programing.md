---
layout: modern-post
title: "Meta Ruby Programing"
date: 2012-03-06
tags: [java, ruby, software-development, programming]
description: "A blog post about meta ruby programing and software development."
share: true
comments: true
---

meta programing ruby读书笔记

### Open Class
  给予了你为class增加方法的能力，但是也如同打开了潘多拉魔盒，一旦通过Open Class增加了class方法导致重名问题，将很难定位。

### Instance variable
  和Java不同，Ruby中的instance_variable 与class之间没有直接联系，你可以从一个class创建不同实例，并且各自拥有不同的instance variable.  (What's the purpose?)

### Method
  Ruby中，method保存在class中

### Object
  一个object是一组instance variable以及这个object所属的class的引用.

### Class
  Ruby中，所有的class都是类Class的instance object. 
  class是一个Class的实例、一组instance method、一个到super class的引用.

### Differences between Class and Module
  Module is meant to be included (or mixined).
  Module can be used as namespace.
  Class is meant to be initlized or inherinted.

### Dynamic Methods
  ruby中，可以在class定义时通过define_methods动态地定义方法,
如下代码动态地为class Computer添加了三个方法 mouse, cpu, keyboard:

```ruby
class Computer
  def initialize(computer_id, data_source)
    @id = computer_id
    @data_source = data_source
  end

  def self.define_component(name) 
    define_method(name) {
      info = @data_source.send "get_#{name}_info", @id
      price = @data_source.send "get_#{name}_price", @id 
      "#{name.to_s.capitalize}: #{info} ($#{price})" 
    }
  end

  define_component :mouse
  define_component :cpu
  define_component :keyboard
end
```

### Method Missing
  ruby中，当尝试对receiver调用一个不存在的方法时，该receiver的method_missing方法会被调用，利用这一特性，可以通过重载 method_missing实现动态定义属性、方法效果, 通过method missing机制定义出来的方法被称为*Ghost Method*。
  例如：

```ruby
class Computer
  def initialize(computer_id, data_source)
    @id = computer_id
    @data_source = data_source
  end

  def method_missing(name, *args)
    info = @data_source.send("get_#{name}_info", args[0])
    price = @data_source.send("get_#{name}_price", args[0])
    "#{name.to_s.capitalize}: #{info} ($#{price})"
  end

  #重写respond_to会使利用method_missing实现的动态方法与实际定义的方法无异
  def respond_to?(method)
    @data_source.respond_to?("get_#{method}_info") || super
  end
end
```

这些通过method_missing机制创建出来的methods被称为`ghost method`.

### Flat Scope
在*ruby*中，*class*，*module*，def被称为scope gate，当程序遇到这几个关键字时，程序的scope就会发生变化，如果需要在scope之间共享变量，则可以使用`Class.new`代替*class*和*module*,
`Module#define_method`代替*def*，如：

```ruby
my_var = 12
MyClass = Class.new do
  # my_var is visiable here
  ...
  define_method :my_method do
    # my_var is visiable here
  end
end
```

### Object#instance_eval()
  改变self的值为指定实例，同时改变“current class”为当前实例的eigenclass, 在此实例上下文中执行一个block

### Module#class_eval() or Module#module_eval()
  改变self的值为指定实例，同时改变“current class”为当前方法的receiver，在此实例上下文中执行一个block


### Deferred Evaluation
  定义一个block，proc，lambda，然后在其他地方调用此block，proc，lambda，这就叫做Deferred Evaluation

### Singleton Method
  单独给一个object instance定义的method，称之为singleton method
  class methods可以认为是一个class对象的singleton method

### Class Macro
  class macro看起来像是关键字，但是实际上就是普通的方法，但是这些方法常在声明定义class中使用。


### Eignclass
  对象除了有一个其被创建时声明的那个class外，还会有它自己的一个不可见的，特殊的class，这个class被叫做eigenclass，也被称为singleton class。一个对象的singleton method就存在于这个对象的eignclass上，eignclass的superclass是这个对象的对外呈现的那个class(参考下面的示例代码)。

```ruby
class Duck
  #code omited
end
#Duck就是a_duck对外呈现的class
a_duck = Duck.new
```


通过下面的语法，你可以进入到一个对象的eignclass内部

```ruby
class << obj
  # you are in the eigen class scope.
end
```


或者可以通过下面的语法获取对eignclass的引用

```ruby
metaclass = class << matz; self; end
```

### Scope changing
```ruby
class Person
  #self is the class object `Person` 
  class << self
    #self is the eignclass of class object `Person`
    def species
          "Homo Sapien"
    end
  end
end

Person.instance_eval do
  #method will be defined on eignclass	of class object `Person`
  #but self is the class object `Person`
  def species
    "Homo Sapien"
  end
  self.name #=> "Person"
end
```


### 给对象的eignclass增加singleton方法：

```ruby
#给对象增加singleton方法
matz = Object.new
def matz.speak
  "Place your burden to machine's shoulders"
end

#给类增加singleton方法（class methods）
class Person
end

def Person.speak 
  "Place your burden to machine's shoulders"
end
```

### Class Extension Mixin
```ruby
module M
  def included(clazz)
clazz.extend ClassMethods
  end

  #定义在这个内部module里的方法会变成inclusor的class method
  module ClassMethods
def a_class_method
    end
  end
end
```

