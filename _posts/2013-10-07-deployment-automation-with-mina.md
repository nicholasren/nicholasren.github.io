---
layout: post
title: "Rails application deployment automation with mina"
comments: true
---
Rails application deployment automation with mina

### TLDR:

In this post, I will introduce a really fast deployment tool - `Mina`, and show you how to deploy a rails application which runs on `unicorn` with `nginx`, also I'll show you how to organize your mina deployment tasks.


###### Note:
All code in this post can be find [here](https://gist.github.com/nicholasren/6920178).

#### About mina

"[Mina](http://nadarei.co/mina/) is a readlly fast deployer and server automation tool", this how the team who built it describes it. The concept behind `Mina` is to connect to a remote server and executes a set of shell command that you define in a local deployment file(`config/deploy.rb`). One of its outstanding feature is it is really fast because all bash instructions will be performed in one SSH connection.

#### Init
To use mina automating deployment, you need to get the following things ready.

1. a remote sever
2. create a user for deployment (e.g. deployer) and add this user into sudoer list.
3. generate a ssh key pair, add the generated public key into GitHub.
4. create a deployment target fold on the remove server(e.g. '/var/www/example.com')

once you got these things done, run `mina init` in your project directory, this will generate a deployment file - `config/deploy.rb`, then set the server address, deployment user, deployment target and other settings in deployment file, like the following:

    set :user, 'deployer'
    set :domain, ENV['on'] == 'prod' ? '<prod ip>' : '<qa ip>'
    set :deploy_to, '/var/www/example.com'
    set :repository, 'git@github.com:your_company/sample.git'
    set :branch, 'master'

#### Setup
Then run `mina setup`, this will create deployment folders, which looks like this:

    /var/www/example.com/     # The deploy_to path
    |-  releases/              # Holds releases, one subdir per release
    |   |- 1/
    |   |- 2/
    |   |- 3/
    |   '- ...
    |-  shared/                # Holds files shared between releases
    |   |- logs/               # Log files are usually stored here
    |   `- ...
    '-  current/               # A symlink to the current release in releases/


#### Provision
It is very common to setup a new server and deploy application on it, it will be good if we can automating this process, here comes the **provision** task:

{% highlight ruby%}
    task :provision do
      # add nginx repo
      invoke :'nginx:add_repo'

      queue  "sudo yum install -y git gcc gcc-c++* make openssl-devel mysql-devel curl-devel nginx sendmail-cf ImageMagick"

      #install rbenv
      queue  "source ~/.bash_profile"
      queue  "#{exists('rbenv')} || git clone https://github.com/sstephenson/rbenv.git ~/.rbenv"
      queue  "#{exists('rbenv')} || git clone https://github.com/sstephenson/ruby-build.git ~/.rbenv/plugins/ruby-build"
      queue  "#{exists('rbenv')} || echo 'export PATH=\"$HOME/.rbenv/bin:$PATH\"' >> ~/.bash_profile && source ~/.bash_profile"

      #install ruby
      queue  "#{ruby_exists} || RUBY_CONFIGURE_OPTS=--with-openssl-dir=/usr/bin rbenv install #{ruby_version}"

      #install bundle
      queue  "#{ruby_exists} || rbenv local 2.0.0-p247"
      queue  "#{exists('gem')} || gem install bundle --no-ri --no-rdoc"

      #set up deploy to
      queue "sudo mkdir -p #{deploy_to}"
      queue "sudo chown -R #{user} #{deploy_to}"

    end

    #helper method
    def ruby_exists
    "rbenv versions | grep #{ruby_version} >/dev/null 2>&1"
    end

    def exists cmd
      "command -v #{cmd}>/dev/null 2>&1"
    end
{% endhighlight%}

to be able run this taks multi times, I create some helper method detecting whether an executable exists or not. e.g. `ruby_exists`, `exits('gem')` these helper method will return if the executable exits, otherwise, it will run next command to install the executable.

With this task, you can get a server ready for deployment in seveural minutes.

#### Deploy

Once the server is provisioned, you can deploy your application with `mina deploy`, here is a typical deploy task:

{% highlight ruby%}
    desc "Deploys the current version to the server."
    task :deploy => :environment do
      deploy do
        invoke :'git:clone'   #clone code from github
        invoke :'deploy:link_shared_paths' #linking shared file with latest file we just cloned
        invoke :'bundle:install' #install bundle
        invoke :'rails:db_migrate' #run database migration
        invoke :'rails:assets_precompile' #compile assets
        invoke :'unicorn_and_nginx' #setup nginx and unicorn config
        to :launch do
          queue '/etc/init.d/unicorn_myapp.sh reload' #reload unicorn after deployment succeed
        end
      end
    end
{% endhighlight%}

#### Unicorn and nginx
to run our application on unicorn and nginx, we need to create our own unicorn and nginx configuration file and start nginx and unicorn with our configuration. here is the task:

{% highlight ruby%}
    desc "Setup unicorn and nginx config"
    task :unicorn_and_nginx do
      queue! "#{file_exists('/etc/nginx/nginx.conf.save')} || sudo mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.save"

      queue! "#{file_exists('/etc/nginx/nginx.conf')} || sudo ln -nfs #{deploy_to}/current/config/nginx.conf /etc/nginx/nginx.conf"

      queue! "#{file_exists('/etc/init.d/unicorn_avalon.sh')} || sudo ln -nfs #{deploy_to}/current/scripts/unicorn.sh /etc/init.d/unicorn_myapp.sh"
    end
{% endhighlight%}

#### Conclusion
With these tasks: `mina init`, `mina provision`, `mina deploy`, mina helps you deploying easily with less mistake, have fun with mina!
