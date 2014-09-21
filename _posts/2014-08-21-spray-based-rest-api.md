---
layout: post
title: "spray based rest api"
comments: true
---

> Spray is an open-source toolkit for building REST/HTTP-based integration layers on top of Scala and Akka. Being asynchronous, actor-based, fast, lightweight, modular and testable it's a great way to connect your Scala applications to the world.

###TLDR;
This post will give you a example of how to use spray to build a REST api.

#### Problem
you want to build a REST api that support the following operations:

```
GET     /users/:id
POST    /users
```

###routing
`spray-routing` gives you a elegant DSL to build routing system, which will accept http request and respond correctly. let's see the example:
{%highlight scala%}

//File: src/scala/com/example/MyService.scala

trait MyService extends HttpService {
  implicit val ec: ExecutionContext = actorRefFactory.dispatcher
  val userRepository: UserRepository

  val myRoute =
    path("users" / Segment) {
      userId => {
        get {
          complete {
            //must import SprayJsonSupport to get a json mashaller
            import spray.httpx.SprayJsonSupport._
            userRepository fetch userId
          }
        }
      }
    }
}
{%endhighlight%}
The `MyService` trait extends `spray.routing.HttpService` which includes a bunch of convinient mehtods for creating DSL, such as `path`, `get`, `complete`.
The variable `myRoute` defines a set of rules:

- When a http request matches `GET /users/:id`, call `userRepo.get` with extracted `userId`, and response with the result.
- When a http request matches `POST /users/`, call `userRepo.save` with extracted `userData`, and response correponded status code.

Note that there is a field defined as `val userRepository: UserRepository` not be initialized. This field will be implemened in a acturall actor (`MyServiceActor` in this example).
The actural business logic was deleagted into this object.


###json support
I haven't find a JSON library in __Java/Scala__ world which providing as good api as __Ruby__ doses. if you konw one please let me know.

[spray-json](https://github.com/spray/spray-json) is the most beautiful one I ever found!

`spray-json` allows you to convert between:

- String JSON documents
- JSON Abstract Syntax Trees (ASTs) with base type JsValue
- instances of arbitrary Scala types

in this post, we just want to convert between JSON documents and Scala case class. To enable JSON serialization/deserialization for your case class, just define a implicit method which returns a instance of `RootJsonFormat[YourCaseClass]`.

{%highlight scala%}

//File: src/scala/com/example/User.scala

package com.example

import spray.json.DefaultJsonProtocol._
import spray.json.RootJsonFormat


case class User(name: String, age: Int)
object User {
  implicit def userJsonFormat: RootJsonFormat[User] = jsonFormat2(User.apply)
}
{%endhighlight%}

###Put them together
As we metioned before, `Spray` is built on top of Scala and Akka,
to enable `MyService` to handle http request, we need to create a actor:

{%highlight scala%}
class MyServiceActor(userRepo: UserRepository) extends Actor with MyService {

  def actorRefFactory = context

  def receive = runRoute(myRoute)

  override val userRepository: UserRepository = userRepo
}
{%endhighlight%}
This actor mixin `MyService`, in the `receive` method,
call `runRoute` to handle http request with pre-defined route.

###A Tips:

####put your business logic in plain scala object instead of actor.
I found that it is really hard to test logic in a actor, so I preferred to implate business logic in a pure scala class, then it is much easier to test it.
then inject a instance of this class into a actor.


The full exmaple can be found [here.](https://github.com/nicholasren/spray-rest-api)
