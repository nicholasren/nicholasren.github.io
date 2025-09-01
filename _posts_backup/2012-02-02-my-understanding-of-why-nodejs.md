---
layout: post
title: My understand of why nodejs
---
Thread per connection VS Event loop
>Advantage:  
 more memory consumption 
 thread blocked waiting for I/O operation 
  
+ Q: So why not Event loop, callbacks, non-blocking I/O 
+ A: cultural and infrastructural. 
   1. cultural, we thought that the I/O should be blocking. 
   2. infrastructural 
      + single threaded event loops require&nbsp;I/O to be non-blocking, but&nbsp;most libraries are not. 
      + too much options: EventMachine, Twisted 

+ Q: Why javascript? 
+ A: javascript has the following features: 
   1. Anonymous functions, closures.  -- easy to create callback 
   2. Only one callback at a time. -- only one callback at a time 
   3. I/O through DOM event callbacks  --non-blocking 
   4. promise: a promise is a kind of *EventEmitter* which emits either&nbsp;"success" or "error". (But not&nbsp;both.)
