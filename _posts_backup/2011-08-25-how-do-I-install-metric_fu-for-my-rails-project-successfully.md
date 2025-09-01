---
layout: post
title: how do I install metric_fu for my rails project successfully
---
<p><span style="font-family: Comic Sans MS;"><span style="white-space: pre;">	</span>
This blog is talking about how I install metric_fu in a rails project.</span>
</p>
<p><span style="font-family: Comic Sans MS;">firstly, I typed a command &quot;gem install metric_fu&quot;, unfortunatlly, I got a error message like this</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="color: #ff0000;"><span style="white-space: pre;">	</span>
&quot;ERROR: &nbsp;While executing gem ... (Gem::DependencyError)</span>
</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="color: #ff0000;"><span style="white-space: pre;">	</span>
&nbsp;Unable to resolve dependencies: metric_fu requires chronic (~&gt; 0.3.0)&quot;</span>
</span>
</p>
<p><span style="font-family: Comic Sans MS;"> seems that metric_fu can not find the required verion of chronic gem, then I googled chronic, and know that chronic is time parsing tool writen in ruby, the latest version of chronic is 0.6.2.&nbsp;</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="white-space: pre;">	</span>
so how should I solve this problem?</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="white-space: pre;">	</span>
as I know, a gem package is just like a jar file, which contains &nbsp;class files and some manifests files. but a gem package can do one more thing - telling you the name and version of those gems it depends on. &nbsp;so I got a soluation : &nbsp;change the version declaration of chronic in the &quot;dependency declaration file&quot;, telling metric_fu to use the latest verion of chronic.</span>
</p>
<p><span style="font-family: Comic Sans MS;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Then I&nbsp; googled again, and a got a import information - people can install gem from source ,&nbsp;</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="white-space: pre;">	</span>
here is the steps:</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="white-space: pre;">	</span>
<span style="color: #800080;">1. download the correct version of gem source code from &nbsp;code base (github in general)</span>
</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="color: #800080;">&nbsp; &nbsp; &nbsp; &nbsp; 2. build a gem package from the source.&nbsp;</span>
</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="color: #800080;">&nbsp; &nbsp; &nbsp; &nbsp; 3. install the gem package you built.</span>
</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="white-space: pre;">	</span>
for more detail, you can see <a href="http://raflabs.com/blogs/silence-is-foo/2010/07/19/installing-a-gem-fork-from-github-source/" target="_blank">here</a>
.</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="white-space: pre;">	</span>
<strong><span style="color: #000000;">Note</span>
</strong>
: step 2 is the key point.</span>
</p>
<p><span style="font-family: Comic Sans MS;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; before I build my metric_fu gem, I check a file named </span>
</p>
<p><span style="font-family: Comic Sans MS;">&nbsp; &nbsp; &nbsp; &nbsp; &quot;metric_fu.gemspec&quot;, and found out that this is the &quot;dependency description file&quot;</span>
</p>
<p><span style="font-family: Comic Sans MS;"><br />
</span>
</p>
<p><span style="font-family: Comic Sans MS;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; then I find the dependency description of chronic &quot;s.add_dependency(&quot;chronic&quot;, [&quot;&gt;= 0.3.0&quot;])&quot;</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="white-space: pre;">	</span>
modify the version to &quot;0.6.2&quot;, run command &quot;gem build&nbsp;metric_fu.gemspec&quot;, &nbsp;so I got a metric_fu gem depends on chronic 0.6.2.</span>
</p>
<p><span style="font-family: Comic Sans MS;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; finaly, cd to my project directory,</span>
</p>
<p><span style="font-family: Comic Sans MS;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; run command &quot;gem install ../gem_repositry/metric_fu.gem&quot;,&nbsp;</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="white-space: pre;">	 this time, </span>
the metric_fu is installed successfully. </span>
</p>
<p><span style="font-family: Comic Sans MS;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Hope this information is helpful for you.</span>
</p>
<p>&nbsp;</p>
<p><span style="font-family: Comic Sans MS;"><span style="white-space: pre;">	</span>
<strong>Update: </strong>
this is not a good pratice. </span>
</p>
<p><span style="font-family: Comic Sans MS;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;you can install a old version of chronic manually, and then install metric_fu 2.1.1.</span>
</p>
<p><span style="font-family: Comic Sans MS;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; and I met another problem when running metric_fu in ruby 1.9.2 with syntax 1.0 - &quot;invalid UTF8 charater sequence&quot;, you can find the issue<a href="https://github.com/jscruggs/metric_fu/issues/61" target="_blank"> here</a>
.</span>
</p>
<p><span style="font-family: Comic Sans MS;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; my soluation is just like <a href="https://github.com/jscruggs/metric_fu/issues/61#issuecomment-827265" target="_blank">Jscruggs said</a>
. here is my configuration code:<span style="white-space: pre;"></span>
</span>
</p>
<p><span style="font-family: Comic Sans MS;"><span style="white-space: pre;">
<span style="font-family: Courier;"><span style="color: #339966;">          MetricFu::Configuration.run do |config|
              <span style="color: #ff0000;">config.syntax_highlighting = false</span>
          end</span>
</span>
</span>
</span>
</p>
