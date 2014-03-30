---
layout: post
title: 解决一问题——Oracle中 Char 与 Varchar
---
<p>&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; 给一个现有的项目添加新功能，需要对数据库做更新：写SQL语句，创建PreparedStatementd对象，绑定参数，执行statement，提交事务，很简单的一件事。然而这里问题出现了，log里生成的SQL语句看起来<span style="color: #ff0000" class="Apple-style-span"><span style="font-weight: bold" class="Apple-style-span">异常地</span></span>正确，但是却不能对数据库里的数据更新，JUnit运行失败。这个项目的框架构建者对PreparedStatement自己再做了层封装，实现了一个logable的PreparedStatement，所以日志里的sql都是和参数绑定好的，拿来在SQLDeveloper里运行，很完美，数据被更新了，得到了预想的结果。怎么会这样？挠头中&hellip;&hellip;</p><p>&nbsp;&nbsp; &nbsp; &nbsp; &nbsp; 分析原因：SQL不正确？没有提交事务？仔细检查下代码，两个假设很快就被否定了。想什么招呢？从更新条件下手，总共有三个更新条件（where A= ？ and B=？ and &nbsp;C=？）先把要更新的数据库表里的数据备份，然后修改SQL语句的更新条件成（where A = ？），运行JUnit，更新成功！然后慢慢增加更新条件，最终将问题锁定在条件B，只要加上条件B，JUnit就失败了，再看绑定B的那段代码：</p><p>&nbsp;<span style="color: #339966" class="Apple-style-span">&nbsp;</span><span style="background-color: #c0c0c0" class="Apple-style-span">s</span><span style="color: #993366" class="Apple-style-span"><span style="background-color: #c0c0c0" class="Apple-style-span"><span style="color: #000000" class="Apple-style-span">tmt.setString（2， XXX）;</span>&nbsp;</span></span></p><p>再看数据库里的B对应的那个列的类型，是 Char(12)</p><p>查看了下Oracle官方网站里对数据类型的解释：</p><span style="font-family: 'times new roman'; font-size: 16px; line-height: normal" class="Apple-style-span"><table border="1" width="100%" style="font-family: Helvetica, Arial, Verdana, geneva, sans-serif; font-weight: normal; font-size: 100%" bordercolor="#A6A6A6"><tbody><tr style="font-family: verdana, geneva, helvetica, sans-serif; font-weight: normal; font-size: 100%"><td width="17%" style="font-family: verdana, geneva, helvetica, sans-serif; font-weight: normal; font-size: small">CHAR(size)</td><td width="18%" style="font-family: verdana, geneva, helvetica, sans-serif; font-weight: normal; font-size: small">Fixed length character data of length size bytes. This should be used for fixed length data. Such as codes A100, B102...</td></tr></tbody></table></span><p>&nbsp;</p><p>Char型是定长的，在这里DB里的数据都是12位的，长度小于的12的数据被存放到这个域时，oracle会自动用空格补足称12位。&lsquo;abc &nbsp; &nbsp; &nbsp; &nbsp; &rsquo;和'abc'当然是不相等的。&nbsp;</p><p>修改sql语句，改为&ldquo;TRIM(B)= ?&rdquo; ，再运行，更新成功。</p><p>这个问题虽然不难解决，但是解决问题的方法却也是值得mark下的。<img src="http://public.blogbus.com/biaoqing/163/11.gif" border="0" alt="" /><img src="http://public.blogbus.com/biaoqing/163/11.gif" border="0" alt="" />&nbsp;</p><p>&nbsp;</p>