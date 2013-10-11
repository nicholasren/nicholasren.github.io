---
layout: post
title: "rails best practice"
---
###Move code from controller to model   
1. move finder to named scope.   
2. use model association.   
    example:   
    {% highlight ruby %}
       @current_user.posts.build(param[:post])
    {% endhighlight %}
3. use scope access.   
4. add virtual attribute.
5. use model callback. (before_save/after_save).
6. replace complex creation with factory method.
7. move model logic into model.


