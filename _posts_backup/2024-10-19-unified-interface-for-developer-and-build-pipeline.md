---
layout: modern-post
title: "Unified Interface for Developer and Build Pipeline"
date: 2024-10-19
tags: [devops, ci-cd, build-pipeline, developer-experience, automation]
description: "How unified CLI interfaces between development machines and CI agents can improve developer experience and troubleshooting capabilities."
comments: true
share: true
---
## Issue
I've see many times that developers struggle to diagnosis failing build. 
"Why the test/deployment passed on my machine but failed in build pipeline?" This might be the most frequent questions developer asked.  
Back in the old days, developer can ssh to the build agent, go straight into the build's working directory, and start diagnosis.  
Now, with many pipeline as service such as [CireCI](https://circleci.com/), [Buildkite](https://buildkite.com/) , developers have much less access to build server and agent than ever before.  They can not perform these kind of diagnosis, without mentioning many drawbacks of this approach.

What are the alternative? One common approach I seen is,  making small tweaks and pushing changes fiercely, hoping for one of those many fixes would work or reveals the root cause. This is both insufficient.  
## Solution
I tend to follow one principal when setup pipeline in a project. 
> Unified CLI interface for dev machine and ci agent.  
Developer's should be able to run a build task on their dev machine and CI agent if they're granted the correct permission.
### Examples
For example, a deployment script should have the following command line interface

```shell
./go deploy <env> [--local]
```
When this script is executed on a build agent,  the script will try to use the build agent role to perform deployment.  

When it is executed from a developer's machine, they would need to provide their `user id` and  prompted for password (potentially one time password) to acquire permission for deployment.  
## Benefits
There're many benefits by following this principal:

- Improved developer experience.
	- The feedback loop of changes are much faster comparing to testing every changes on pipeline.
	- Enabling developer executing tasks on their local machine help them trial new ideas and trouble shooting.

- Knowledge are persisted.
	- Developer are smart, they would always find some trick to improve their efficiency for trouble shooting. 
	  It could be temporarily comment out or add few lines in the script, these knowledge tend get lost if they were not persisted as a pattern.  
	  The principal would encourage developers to persist these knowledge into build script, this would benefit all developers worked on this project.  
