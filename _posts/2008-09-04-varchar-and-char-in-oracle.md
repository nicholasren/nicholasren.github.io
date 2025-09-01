---
layout: modern-post
title: "Varchar And Char In Oracle"
date: 2008-09-04
tags: [software-development, programming]
description: "A blog post about varchar and char in oracle and software development."
share: true
comments: true
---

解决一问题——Oracle中 Char 与 Varchar

给一个现有的项目添加新功能，需要对数据库做更新：
写SQL语句，创建PreparedStatementd对象，绑定参数，执行statement，提交事务，很简单的一件事。
然而这里问题出现了，log里生成的SQL语句看起来
异常地正确，但是却不能对数据库里的数据更新，JUnit运行失败。
这个项目的框架构建者对PreparedStatement自己再做了层封装，实现了一个logable的PreparedStatement，
所以日志里的sql都是和参数绑定好的，拿来在SQLDeveloper里运行，很完美，数据被更新了，得到了预想的结果。
怎么会这样？挠头中

### 分析原因：
SQL不正确？没有提交事务？仔细检查下代码，两个假设很快就被否定了。
想什么招呢？从更新条件下手，总共有三个更新条件（where A= ？ and B=？ and C=？）
先把要更新的数据库表里的数据备份，然后修改SQL语句的更新条件成（where A = ？），运行JUnit，更新成功！
然后慢慢增加更新条件，最终将问题锁定在条件B，只要加上条件B，JUnit就失败了，
再看绑定B的那段代码：
```
ptmt.setString(2,XXX);
```

再看数据库里的B对应的那个列的类型，是 `Char(12)`
查看了下Oracle官方网站里对数据类型的解释：
>
  CHAR(size) Fixed length character data of length size bytes. This should be used for fixed length data. Such as codes A100, B102...

Char型是定长的，在这里DB里的数据都是12位的，长度小于的12的数据被存放到这个域时，oracle会自动用空格补足称12位.

"abc&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"和'abc'当然是不相等的
修改sql语句，改为`TRIM(B)= ?` ，再运行，更新成功。
这个问题虽然不难解决，但是解决问题的方法却也是值得mark下的。
