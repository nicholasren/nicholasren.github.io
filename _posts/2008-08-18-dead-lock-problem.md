---
layout: post
title: 解决了一个死锁问题
---
解决了一个死锁问题


此问题中涉及到的对象有`Subject` , `Enclosure` , `SubjectEnclosure` 三个对象，
数据库中对应的三张表为 `tbl-subject`, `tbl-enclosure`, `tbl-subject-enclosure`。

Subject和enclosure为一对多关系，在Subject中有个`Set<SubjectEnclosure >`属性，用于保存隶属于该subject的附件，
`SubjectEnclosure`中有个`Subject`类型的属性（many to one），
`Enclosure`类型的属性(one to one)此外还有一些其他属性（这也是为什么要做这个中间对象的原因）

### 问题描述：
在对一个Subject 类型的对象做更新时，如果连续多次更新，偶尔会出现server没有响应的情况，只有把tomcat重启才能恢复正常。

### 现象分析：
能够导致服务阻塞，重复操作才能偶尔出现，并且把tomcat重启后就能恢复正常，会不会是数据库发生了死锁？用下面的脚本一跑，出现如下结果：

查看死锁的脚本：
```sql
SELECT substr(v$lock.sid,1,4) "SID",
       substr(username,1,12) "UserName",
       substr(object-name,1,25) "ObjectName",
       v$lock.type "LockType",
       decode(rtrim(substr(lmode,1,4)),
       '2','Row-S (SS)','3','Row-X (SX)',
       '4','Share',     '5','S/Row-X (SSX)',
       '6','Exclusive', 'Other' ) "LockMode",
       substr(v$session.program,1,25) "ProgramName"
FROM V$LOCK,SYS.DBA-OBJECTS,V$SESSION
WHERE (OBJECT-ID = v$lock.id1
      AND v$lock.sid = v$session.sid
      AND username IS NOT NULL
      AND username NOT IN ('SYS','SYSTEM')
      AND SERIAL# != 1);

```
结果：

```
table                      lockType      lockMode
tbl-subject                  TM          ROW-X(SX)行级排他锁，提交前不允许做DML操作
tbl-enclosure                TM          ROW-X(SX)
tbl-subject-enclosure        TM          ROW-X(SX)
```
再查看一下更新subject时执行的sql语句。

```sql
update tbl-subject set ......
update tbl-subject-enclosure set ...
update tbl-enclosure set ...
update tbl-subject-enclosure set ... 
update tbl-enclosure set ...
-------------------如果发生死锁，下面的sql就无法执行----------------------------
update tbl-subject-enclosure set ...

```

### 解决方案
因为是 tbl-subject-enclosure这个表被锁住了.
仔细分析sql语句， tbl-enclosure只有在插入subject时需要被插入数据库，
后面对subject的更新操作只需要维护tbl-subject-enclosure这个中间表就可以了，
无需对tbl-enclosure做更新操作，更改SubjectEnclosure中Enclosure类型属性（one to one）的级联type（原来是ALL，改为MERAGE），
再更新Subject，发现此时已经不更新enclosure表了，死锁不再出现了！
