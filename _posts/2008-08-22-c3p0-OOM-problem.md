---
layout: modern-post
title: "C3p0 OOM Problem"
date: 2008-08-22
tags: [java, software-development, programming]
description: "A blog post about c3p0 oom problem and software development."
share: true
comments: true
---

c3p0的helper线程数目过多导致内存溢出


前阵子做得那个系统发布了，结果刚放到服务器上就出了 outOfMemery 错误。 查看发现是由于下的进程导致的：

```java
Daemon Thread [com.mchange.v2.async.ThreadPoolAsynchronousRunner$PoolThread-#0] (Running)
```

经过查找，发现在datasource里把c3p0的numHelperThreads设成了1000。正是由于这个线程过多导致了内存溢出，改成10就没有问题了。附上c3p0里对于 numHelperThreads的描述：

>
  numHelperThreads
    Default: 3
  c3p0 is very asynchronous. Slow JDBC operations are generally performed by helper threads that don't hold contended locks. Spreading these operations over multiple threads can significantly improve performance by allowing multiple operations to be performed simultaneously.
