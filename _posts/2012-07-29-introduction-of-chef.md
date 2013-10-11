---
layout: post
title: "Getting started with chef"
---
###Set up a ubuntu node and run recipe on it
####Predication: 
  1. a running ubuntu node which accessiable via SSH from your labtop(workstation)
  2. <b>cd</b> to chef-repo directory.
<br/>
####Steps:   
<br/>
#####Bootstrap ububtu:   
{% highlight ruby%}
knife bootstrap IP_ADDRESS -x USERNAME -P PASSWORD --sudo
{% endhighlight%}    
<br/>
#####Verify the installation completed
{% highlight ruby%}
knife client list
{% endhighlight%}   
you will see your nodename in the client list   
<br/>
#####Download cookbooks from community site
{% highlight ruby%}
knife cookbook site install getting-started
{% endhighlight%}   
the cookbook named "getting-started" will be downloaded into chef-repo/cookbooks/   
<br/>
#####Upload the recipe to Hosted Chef so it is available for our nodes 
{% highlight ruby%}
knife cookbook upload getting-started 
{% endhighlight%}
<br/>
#####Add this new recipe to the new nodes run list
{% highlight ruby%}
knife node run_list add NODENAME 'recipe[getting-started]'
{% endhighlight%}
<br/>
#####Run the added recipe remotely via ssh
{% highlight ruby%}
knife ssh name:NODENAME -x USERNAME -P PASSWORD "sudo chef-client" -a ipaddress
{% endhighlight%}
<br/>
#####Runnig chef-client as a deamon
{% highlight ruby%}
knife cookbook site install chef-client
knife cookbook upload chef-client
knife node run_list add NODENAME 'recipe[chef-client]'
knife ssh name:NODENAME -x USERNAME -P PASSWORD "sudo chef-client" -a ipaddress
{% endhighlight%}
<br/>
####Advanced tips:
- add recipe when bootstrap node
{% highlight ruby%}
knife bootstrap IP_ADDRESS -r 'recipe[chef-client]' -x USERNAME -P PASSWORD --sudo
{% endhighlight%}
