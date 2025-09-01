---
layout: post
title: "Polymorphic Association"
---
Polymorphic Association

有这么一个需求，一个在线音乐商店系统，我们暂且叫它'online-store'，需要记录消费者对每首歌的评论，一个有经验的rails developer会很快地写出下面的代码:   

{% highlight ruby %}
class Music
  has_many :comments
end

class Comment
  belongs_to :music
end
{% endhighlight %}
对应的表结构如下：  
{% highlight cucumber%}
#musics:   
  |  id  | integer|   
  | name | varchar|   
  | ...  |  ...   |   
{% endhighlight%}

{% highlight cucumber%}
#comments:   
  | id      | integer|   
  | text    | varchar|   
  | music_id| integer|   
{% endhighlight%}

如果需要给music添加，查看评论,可以通过如下代码实现：   
{% highlight ruby%}
  #添加评论
  music.comments.create {:text => 'this is realy nice'}
  #查看评论
  music.coments
{% endhighlight%}
风云变幻，斗转星移，apple的app store创造了软件销售的新模式，我们的vendor也坐不住了，决定在现有的音乐商店系统上出售应用程序，电影，游戏等内容，同样，这些内容也需要支持评论,有了前面成功的经验，你信心满满增加了下面几个model：   
{% highlight ruby%}
  class Application
    has_many :comments
  end

  class Movie
    has_many :comments
  end

  class Game
    has_many :comments
  end
{% endhighlight %}
再来看看我们之前写的model Comment:   
{% highlight ruby%}
class Comment
  belongs_to :music
end
{% endhighlight %}
现在需要支持多种内容，而且这些类内容之间出了都可以被评论外，再无其他关联，那这个belongs_to该怎么写呢？一个最直接的思路是，扩展Comment，让其支持对以上四类内容的评论，代码如下：   
{% highlight ruby %}
class Comment
  belongs_to :music, though => "music_id"
  belongs_to :game, though => "game_id"
  belongs_to :application, though => "application_id"
  belongs_to :movie, though => "movie_id"
end
{% endhighlight %}
表结构如下：   
{% highlight cucumber%}
#comments:   
  | id             | integer|   
  | text           | varchar|   
  | music_id       | integer|   
  | game_id        | integer|
  | application_id | integer|
  | movie_id       | integer|
{% endhighlight %}

有了以上的model，你就可以给应用程序，电影，游戏增加评论了：   
{% highlight ruby %}
  #创建评论
  application.comments.create {:text => "this is a nice app"}
  movie.comments.create {:text => "this is a nice movie"}
  game.comments.create {:text => "this is a nice game"}
  #查看评论
  application.comments
  movie.comments
  game.comments
{% endhighlight %}
目前看来，这些代码工作得很好，然而，做为一个有着良好直觉的程序员，你敏锐地觉察到，将来可能有更多的内容出现在这个"onlne-store"中，也会有更多的内容需要支持评论——你成功地识别出一个”易变点“，每当新增一种内容的时候，你就需要打开这个Comment类，新增一个association，同时，还需要增加migration，这个设计明显违背了<a href="http://en.wikipedia.org/wiki/Open/closed_principle">开闭原则”</a>。那么，这个问题该怎么解决呢？  再来分析下这个问题，上面我们提到，这些model唯一的共性是 “可以被评论”，于是我们可以抽象出一个概念——“commentable”。如果我们让comment对象知道它所对应的"commentable"对象的id以及类型（game/application/movie），我们就可以获得一个“commentable”对象的所有comments，参考下面的代码:    
{% highlight ruby%}
  #查看id为1的music的评论
  Comment.find(:commentable_id => 1, :commentable_type => 'music')

  #查看id为1的application的评论
  Comment.find(:commentable_id => 1, :commentable_type => 'application')
{% endhighlight %}

如此，comments的表结构就可以简化为：   
{% highlight cucumber%}
#comments:   
  | id              | integer|   
  | text            | varchar|   
  | commentable_id  | integer|   
  | commentable_type| varchar|
{% endhighlight %}

model代码简化为：   
{% highlight ruby%}
 #添加评论
 Comment.create({:text => "good staff", :commentable_id => "1", :commentable_type => "music"})
 #查看评论
 Comment.find(:commentable_id => 1, :commentable_type => 'music')
{% endhighlight %}

{% highlight ruby%}
  class Comment
    belongs_to :commentable, :polymorphic => true
  end
  class Application
    has_many :comments, :as => :commentable
  end
  class Movie
    has_many :comments, :as => :commentable
  end
  class Game
    has_many :comments, :as => :commentable
  end
  #添加评论
  movie.comments.create {:text => 'this is realy nice'} 
  #查看评论
  movie.coments
{% endhighlight %}
更多关于“polymorphic association”的信息，请参考<a href="http://guides.rubyonrails.org/association_basics.html#polymorphic-associations">这里</a>
怎么样，这样一来，再新增多少种内容类型，处理起来都非常容易，扩展下commentable_type的值就可以了。这个思路的根本出发点在于为**识别、分离变化点**。这类问题可以抽象为这样一个问题："如何把一个概念应用到一组除了这个概念，没有其他任何关联的对象上?" ，此类问题可以采用上述思路解决。
