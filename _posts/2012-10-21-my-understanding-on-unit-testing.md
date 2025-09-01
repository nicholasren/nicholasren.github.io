---
layout: modern-post
title: "My Understanding On Unit Testing"
date: 2012-10-21
tags: [java, testing, software-development, programming]
description: "A blog post about my understanding on unit testing and software development."
share: true
comments: true
---

怎样写单元测试

最近和同事讨论过几次如何写单元测试之后，突然意识到，是要写点什么了。   
什么是单元测试, 维基百科上是这么定义的： 
    unit testing is a method by which individual units of source code, sets of one or more computer program modules together with associated control data, usage procedures, and operating procedures, are tested to determine if they are fit for use.[1] Intuitively, one can view a unit as the smallest testable part of an application. 
简而言之，就是验证系统中最小可测试单元的功能是否正确的自动化测试。因此，单元测试的目地就是“对被测试对象的职责进行验证”, 在写单元测试之前，先识别出被测试对象的职责，就知道该怎么写这个单元测试了。


在我看来，根据被测试对象，单元测试可以分为两大类：“对不依赖于外部资源的组件的单元测试”和“对依赖于外部资源的组件的单元测试”。由于测试的对象的不同，我们需要采用不同的测试方案：

### 对不依赖于外部资源的组件的单元测试
对不依赖于外部资源的组件进行测试时，我们主要关注被测试对象的状态变化是否和预期的一致，而对于其内部实现，则不用关心，举个例子:
{% highlight java%}
Account account = new Account(20)
assertThat( account.withdraw(10).balance(),  is(10))
{% endhighlight %}
开始账户里有20元，扣款10元后余额应该是10元，我们不关心扣款是现金交易还是银行转账，我们只关心扣款功能是正常的, 这就是一种[黑盒测试](http://en.wikipedia.org/wiki/Black-box_testing "黑盒测试")。


### 对依赖于外部资源的组件的单元测试
对依赖于第三方库、组件的接口的组件进行单元测试时，需要对依赖的库进行mock，让依赖库按照约定表现不同的行为，并且，在测试中验证被测试代码是否按照约定正确的调用了第三方接口(是否调用了正确的API, 是否传递了正确的参数), 我们再来看个例子：

{% highlight java%}
//AuthenticateService是一个外部部件通过Web Service暴露的用户鉴权接口，
//在单元测试中，我们使用一个mock的AuthenticateService对象，来验证UserServiceImpl中的接口调用是否正确。
AuthenticationService mockAuthService = createMock(AuthenticateService.class)
UserService userService = new UserServiceImpl(mockAuthService);
User user = new User("nicholasren", "encrypted_password");

assertThat(userService.authenticate(user), is(true));

//期望userService.authenticate中会调用AuthenticateService.authenticate, 并且传递了正确的用户名和加密后的密码
verify(mockAuthService).authenticate(user.getName(), user.getPassword())
{% endhighlight %}
上面的例子中，对于依赖于外部资源的组件，我们需要验证的是**该组件调用了正确的第三方接口，并且传入了正确的参数**，这就是一种[白盒测试](http://en.wikipedia.org/wiki/White-box_testing "白盒测试")。

### 对依赖于框架的组件的单元测试
我把这种情形也归类为“依赖于外部资源的组件的单元测试”，但是特殊的是，被测试对象依赖的是框架，而这个框架代码在单元测试运行是不会被执行，我们来看个例子：
{% highlight javascript%}
  //load.js
  $('.trigger').click(loadItems)

  //...
  loadItems:function() {
    var ajaxLoading = $("<li class='ajax-loading' style='display:block;'>Loading...</li>");
    var itemContainer = $(".container");
    $.ajax({
      url: this.config.itemLoadingUrl + groupID,
      type: 'GET',
      beforeSend: function(){
        itemContainer.append(ajaxLoading);
      },
      complete: function(){
        ajaxLoading.remove();
      },
      success: function (data) {
        itemContainer.append(data);
      },
      error: function () {
        itemContainer.append("<li class='error' style='display:block;'>Oops, connection time out. Please try again later.</li>");
      }
    });
  }
{% endhighlight %}
$.ajax 是jquery提过的发送ajax请求的方法，然而，在spec中，我们无法真正地发送ajax请求，然后再进行验证，于是我们stub了这个方法。 这时候，就有个问题了:   
真正的$.ajax()方法没有被调用，complete，success，error的这几个function都没有被调用，那么这些function中的逻辑该如何测试呢？     

$.ajax是jquery提供的API，出现错误的机率是非常非常低的，因此，我们可以**假设$.ajax是正常工作的**，然后stub $.ajax, 当被测试代码中调用$.ajax时，让其调用我们stub的一个fake function. 
例如，我们想测试ajax request失败时，是否正确地显示了错误信息，那么我们可以写出下面的测试：

{% highlight javascript%}
  //load_spec.js
  it("should show error message when ajax request failed", function(){
    spyOn($, "ajax").andCallFake(function(params) {
      params.beforeSend();
      params.complete();
      params.error("", "404");
    });
  
    var trigger = $(".itemContainer .trigger");
    trigger.click();
  
    expect($(".itemContainer  .error").length).toBe(1);
    expect($(".ajax-loading").length).toBe(0);
  });
{% endhighlight %}

$.ajax 是jquery提过的发送ajax请求的方法，然而，在spec中，我们无法真正地发送ajax请求，然后再进行验证，于是我们stub了这个方法。 这时候，就有个问题了:   
真正的$.ajax()方法没有被调用，complete，success，error的这几个function都没有被调用，那么这些function中的逻辑该如何测试呢？     

$.ajax是jquery提供的API，出现错误的机率是非常非常低的，因此，我们可以假设$.ajax是正常工作的，我们可以stub $.ajax，传入了一个**fake function，在这个fake function中执行我们期望的行为**，然后验证这些function的执行效果。   

使用jasmine的spyOn机制，传入一个fake function，在此function中依次执行 beforeSend， complete，error 这几个callback，（注意上面andCallFake里的三行，这也是真实情况下ajax 请求失败时，这些callback被执行的顺序），然后验证error这个callback是否显示了error message。

因此，对于依赖于外部API的组件的测试，当此API在单元测试中不能被执行，我们可以*假设其API工作正常，通过测试代码模拟其API执行的情况, 验证被测试对象的行为*

一句话，**写单元测试之前，弄清被测试对象的职责，然后针对被测试对象的职责进行测试**，单元测试写起来，真的不难。
