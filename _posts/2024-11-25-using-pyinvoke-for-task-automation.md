---
layout: post
title: "using pyinvoke for task automation"
comments: true
---
The main activities for developers to work in a codebase are the following: make some changes, run tests, package and upload some artifacts, deploy the artifacts to a dev environment, and then perform automated or manual tests against the deployed changes. All these tasks are usually automated.

A developer might run `./gradlew test` to execute tests, `./gradlew shadowJar` to create an artifact for distribution, `docker build` and `docker push` to create and publish a Docker image,
`ansible or terraform` to apply infrastructure changes, and `curl` for API testing.

These knowledge areas are usually captured in some automation scripts, typically some bash scripts, manual steps in README.md,
or other markdown files in the codebase, or in the worst cases, reside in your team members' brains, waiting to be captured somewhere.

It is common to see code snippets such as  ./scripts/do_something.sh followed by some more text,
then `./scripts/do_something_else.sh` in  the README.md.

It can be tedious for developers to read through hundred lines of text and understand the correct usage of the scripts.
Sometimes developers have to scan through the bash script to figure out why the provided parameter does not work.
Let us all be honest, it takes great effort to become an expert in working with shell script.
Also, shell script lacks some modern scripting language features, making it hard to create reusable, maintainable code.

---

In the last two years, I have experienced those pains in few codebases that I worked on.
After a few times of frustration with these scripts, I recalled some good examples I saw in Ruby on Rails projects many years ago.
Almost all those tasks above are automated as a rake task. Running `rake -T`, it will show a list of all automation tasks in a codebase.
Each task has a detailed description of its responsibility, expected parameters, etc.

Here are a few benefits of using Rake for task automation, in my opinion.

- It has extremely easy integration with the operating system. Simply put command within backticks “``“, Rake will invoke the command as a separate OS process. e.g `date`
- It is written in the Ruby programming language; developers can create classes and functions for better maintainability.

There are some downsides to using Rake; some Ruby packages (referred to as `gem`) require OS-specific native dependencies.
These dependencies could break during OS updates and cause headaches for developers who have not worked with the Ruby ecosystem.



After shopping around, I found pyinvoke, which provides similar functionality to rake, but it is a Python-based tool.
`invoke -l` will list all tasks in a codebase. Each pyinvoke task is a Python function annotated with `@task`.
Developers define classes and functions and use them in pyinvoke tasks.
Currently, we have migrated all of our shell-script-based build scripts to pyinvoke tasks.
The introduction of pyinvoke has helped us standardize our deployment process, and more developers *feel comfortable creating new automation tasks*.

With the concepts outlined in [Unified interface for developer and Build Pipeline](https://nicholas.ren/2024/10/19/unified-interface-for-developer-and-build-pipeline.html),
we have implemented several pyinvoke tasks featuring a `--local` flag. This enhancement enables developers to test changes locally without the need to push to a branch, thereby creating a quicker feedback loop.

The same task will be used in Bitbucket Pipeline without the `--local` flag.
This has made our life much easier while dealing with some pipeline failures.

### Developer’s experience with pyinvoke
With those tasks automated with Pyinvoke, here is what a developer will perform in their daily work.

- `invoke test` to run all unit tests locally;
- `invoke package --version=<version>` to create the jar and build a Docker image with a specific version;
- `invoke publish --version=<version>` to publish the specific image you just built;
- `invoke deploy --version=<version> --env=<env>` to deploy the version to a specific region;
- `invoke smoke-test --env=<env>` to run some basic post-deployment validation against your service in an environment.
If they forget which task to use, `invoke -l` will show the full list of existing automation tasks.
Developers can also easily create a new one if none of the existing tasks fulfill their needs.
