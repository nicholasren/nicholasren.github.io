---
layout: post
title: "build rest api in scala"
comments: true
---

micro service getting more attractions in the past few years, more and more orgnizations is moving to this area. many framework were created to make building micro service easier,  in java world, we have DropWizard, in ruby world, we have Rails-API, Grape and Lotus. but how the scala guys solve this problem?

in [my previous post](http://nicholasren.github.io/2014/08/21/spray-based-rest-api.html), I demostrated how to build api with [spray](http://spray.io/), in this post I'll try to use another framework - [unfilter](http://unfiltered.databinder.net/Unfiltered.html) and [json4s](https://github.com/json4s/json4s) to build a similar api.


### The problems:
you want to build a api which can accept http request and send response in json format.


to achieve this goal, we need:

- a server listening on a local port, wrap received http request and pass it to the application.
- a request mapping mechanism where you can define how http request should be handled.
- a tool which can covert between plan scala object and json.


Unfilter have it's answer for the first two questions:

#### Request mapping
in unfilter, the request mapping mechanism was called _plan_ and _intent_, a accurat name, right?

from unfilter's document:

> - An intent is a partial function for matching requests.
- A plan binds an intent to a particular server interface.

Here is the code:

{%highlight scala%}
object PushApi extends Plan {
  def intent = {
    case req @ POST(Path(Seg("devices" :: Nil))) => {
      //code omitted
    }
    case req @ POST(Path(Seg("notifications" :: Nil))) => {
      //code omitted
    }
  }
}
{%endhighlight%}

#### Server
Unfilter can be run on top of jetty / netty, to do so, just run your plan with correponded server:

{%highlight scala%}
unfiltered.netty.Server.http(8080).plan(PushApi).run()
//or
unfiltered.jetty.Server.http(8080).plan(PushApi).run()
{%endhighlight%}

####Json serialization/deserialization
The biggest difference between spray-json and json4s is serialization/deserialization done implicitly or explicitly.

in spray-json, you can get serialization/deserialization(aka. [marshalling](http://spray.io/documentation/1.2.2/spray-httpx/marshalling/)) implicitly if you defined your own [JsonFormat](https://github.com/nicholasren/spray-rest-api/blob/master/src/main/scala/com/example/User.scala#L9),
the marshalling mechanism will do their job while extracting information from request and send response implicitly. it's cool when everything works fine, but if something went wrong it's really hard to debug. e.g. [this one](https://github.com/nicholasren/spray-rest-api/blob/master/src/main/scala/com/example/MyService.scala#L27) took me years to find out.

with json4s, you have to [serialize/deserialize your object explicitly](https://github.com/nicholasren/push-example/blob/master/src/main/scala/com/example/unfilter/repos/DeviceRepository.scala#L19), but the api is very neat and easy to use.

peronally, I really like json4s's solution.


### Conclusion
Compared with spray, unfilter focused on request mapping and dispatching, json4s focused on json serialization/deserialization, they both did a very good job. I highly recommand you to try it in your next scala api project.

The full example can be found [here](https://github.com/nicholasren/push-example/)
