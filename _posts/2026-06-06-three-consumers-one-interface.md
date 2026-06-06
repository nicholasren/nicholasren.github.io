---
layout: modern-post
title: "Three Consumers, One Interface"
date: 2026-06-06
tags: [ai, agents, cli, developer-experience, automation, ai-adoption]
description: "When I built a unified CLI for developers and pipelines, I was solving a DevEx problem. It turned out the interface had a third consumer I hadn't met yet."
comments: true
share: true
---

<div class="lang-en" markdown="1">

# Three Consumers, One Interface

When I wrote about [unified CLI interfaces](https://nicholas.ren/2024/10/19/unified-interface-for-developer-and-build-pipeline.html) and [pyinvoke for task automation](https://nicholas.ren/2024/11/25/using-pyinvoke-for-task-automation.html), I was solving a developer experience problem. The same `invoke deploy --env=staging` should work from a laptop and from a CI agent. No divergence, no "it works on my machine."

What I didn't anticipate: there was a third consumer of that interface. I just hadn't met it yet.

---

## The problem with onboarding — human or otherwise

A new engineer joins the team. On day one, they have no context about the codebase, the conventions, or how anything actually gets deployed. The same is true for an AI agent at the start of every session.

The experience also rhymes: both will dig through READMEs, piece together shell commands from documentation, and stumble until someone shows them the right way to run things.

The fix for a new engineer is a good CLI. `invoke -l` prints everything the project knows how to do. Each task has a description. Parameters are explicit. There's no archaeology required. You don't need to understand the whole codebase — you just need to know which commands exist and what they do.

It turns out this is exactly what an AI agent needs too.

---

## Onboarding at scale

The future engineering team won't be all-human. We're moving toward hybrid teams — some humans, many agents. The ratio will vary, but the direction is clear.

These agents come in two forms — or at least, this is how I expect it to play out. Some will be **long-lived** — persistent team members that accumulate context over time, learn the conventions, work alongside the humans for months. Others will be **ephemeral** — spun up on demand for a specific task, zero prior context, expected to be useful immediately and discarded when done. I could be wrong about the details. But the direction feels clear enough to plan for.

Both need onboarding. But the constraints are different.

For a long-lived agent, onboarding looks a lot like it does for a new engineer: ramp up over time, absorb the codebase, learn how the team operates. A good CLI helps — `invoke -l` on day one gives the same orientation it gives a human.

For an ephemeral agent, there's no ramp-up. It arrives with a task and has to self-orient in seconds, not days. It cannot be walked through a README or a wiki checklist. The CLI isn't a nice shortcut here — it's the only viable path.

The implication for ROI is significant. In an all-human team of eight, DevEx investment amortizes across eight engineers and their turnover. In a hybrid team of four humans and ten agents — some long-lived, some spun up daily — that same investment amortizes across every agent instantiation for the life of the project. The return doesn't grow linearly. It compounds with team composition.

The humans in this team are also doing something different. They're not running deployments or diagnosing failures — the agents handle that. They're making decisions: what to build, whether the result is right, when to ship. The CLI is the contract between the decision layer and the execution layer. Both sides need it to be clear.

---

## Discovery is the key property

What makes a CLI agent-friendly isn't just that it's a command. It's that it's *discoverable*.

An agent can run `invoke -l` and get a complete picture of the project's capability surface in seconds:

```shell
invoke test                    #Run unit tests
invoke package --version=X     #Build and tag a Docker image
invoke publish --version=X     #Push the image to the registry
invoke deploy --env=X          #Deploy to the target environment
invoke smoke-test --env=X      #Run post-deployment validation
invoke peek-a-order            #Quick problem diagnosis.
```

No documentation to read. No scripts to grep through. The interface is self-describing.

Compare this to a codebase where tasks live in bash scripts, inline pipeline YAML, and a README that hasn't been updated since Q3. An agent can technically work with that — but it's forced to explore, infer, and guess. Every delegation begins with an exploratory phase before any real work starts. Mistakes are more likely, and the wasted context burns tokens before anything useful happens.

---

## Tacit knowledge, made executable

There's a deeper reason CLI investment pays off for AI adoption.

In most teams, the real knowledge of how things work lives in people's heads. The senior engineer who knows which `--flag` to add when deploying to prod on a Friday. The workaround for the flaky integration test. The correct order of operations for a database migration.

Writing good `invoke` tasks forces that knowledge out of heads and into executable form. The task becomes a small, opinionated artefact — here's how *this team* does this thing.

That's exactly the kind of knowledge an AI agent can act on. Not general knowledge about deployment, but *your team's specific way of doing it*. The CLI is the crystallisation point.

---

## Delegation becomes natural

The practical payoff shows up in how engineers hand work off to agents.

Before: "Can you help me deploy version 1.4.2 to staging? You'll need to build the Docker image first, then push it, then update the manifest and apply it — oh, and check the smoke tests pass."

After: "Run `invoke package --version=1.4.2`, then `invoke publish`, then `invoke deploy --env=staging`, then `invoke smoke-test --env=staging`."

The second version is barely a prompt. It's a sequence of well-defined operations the agent can execute, observe, and report back on. The engineer doesn't need to explain context the CLI already encodes.

This is also how the unified interface idea scales to AI. The same principle that let developers run `./go deploy --local` on their laptop before pushing to CI now lets an agent execute the same commands with the same semantics. Same interface, third consumer.

Once that "After" sequence recurs often enough — and for routine deployments, it will — it's worth going one step further: extracting it as a project-level agent skill.

```markdown
# .agents/skills/deploy/SKILL.md
Deploy a service version to an environment.
Use when asked to release or deploy a version.
Steps: invoke package → invoke publish → invoke deploy → invoke smoke-test.
```

Now the engineer's instruction collapses to: "Deploy 1.4.2 to staging." The agent calls the skill, the skill runs the sequence, the engineer gets a summary. No repeated prompting. No recalling the right order. The CLI provided the raw ingredients; the skill is the recipe.

This is the loop that starts shifting engineers away from repetitive execution and toward decisions that actually need a human — what to ship, when to ship it, and whether the result is good enough.

---

## Progressive disclosure

The reason CLI encapsulation works — for both humans and agents — is that it's an instance of progressive disclosure.

Anthropic's agent skill specification calls this out explicitly as a design principle: only skill descriptions are held in context by default; full skill content loads on demand when the agent determines a skill is relevant. The goal is to keep the context window focused — surface what's needed to decide, defer everything else.

A well-structured CLI does the same thing at the tool layer, one level down:

`invoke -l` — the capability surface. What can be done, one line each. No implementation detail. Enough to know what exists and which direction to go.

`invoke deploy --help` — the interface. Parameters, flags, expected values. You load this only once you've decided to act on a specific task.

The implementation inside the task — the code, the logic, the decisions baked in. Neither the human nor the agent needs to read this to use the task. That's the point of encapsulation.

Agent skills follow the same pattern, one layer up:

```
CLI:
  invoke -l              →  what exists        (always available)
  invoke deploy --help   →  how to use it      (load on demand)
  invoke deploy --env=X  →  execution

Skills:
  skill descriptions     →  what exists        (always in context)
  SKILL.md content       →  how to orchestrate (load when relevant)
  tool/CLI calls         →  execution
```

The agent always holds skill names and one-line descriptions — enough to decide relevance. The full `SKILL.md` loads only when a skill applies. The tool calls and CLI commands inside are implementation detail, executed without cluttering the deliberation.

Same architecture, two layers. Indexed and shallow by default; deep only on demand.

The constraint being managed is context. Too much detail too early crowds out the actual task — whether that's an engineer trying to orient on a new project, or an agent with a finite context window. Progressive disclosure solves it at every layer by surfacing the right abstraction at the right moment.

---

## What this means in practice

If you're trying to improve AI adoption in your team, a good place to start isn't with the AI tooling.

It's with the CLI.

A few concrete examples of what that unlocks:

**Onboarding, human or agent.** Instead of a 15-step wiki page for environment setup, one line in `AGENT.md`: *"Run `invoke -l` to see what this project can do."* That single line gives an agent — or a new engineer — everything it needs to get started. No archaeology. No stale documentation. The CLI is the onboarding doc.

**Reproducing CI failures locally.** A build goes red. The old path: read the pipeline logs, figure out which script failed, manually reconstruct the environment, iterate. The new path: tell the agent "the deploy step failed in CI, reproduce it locally." Because `invoke deploy --env=staging` runs the same code in CI and on your machine, the agent can immediately start narrowing down the failure. Same interface, same semantics, reproducible.

**Routine releases without hand-holding.** A new version is cut. "Package, publish, and deploy 1.5.0 to dev. Run smoke tests and tell me if they pass." The agent runs the sequence, reports the result. The engineer reviews and decides whether to promote. Execution moves to the agent; the decision stays with the human.

**Incident diagnosis on demand.** Something looks wrong in production. `invoke peek-a-order` does a quick snapshot of the system state. "Run peek-a-order and summarise what looks unusual." The agent returns structured observations. The engineer gets signal faster, without having to remember which commands to run or in which order.

In all of these, the CLI did the work of encoding *how*. The engineer gets to focus on *what* and *whether*.

The engineers who've invested in good automation tooling over the years are finding AI adoption surprisingly smooth. It's not a coincidence. They were building the agent interface before they knew agents were coming.

---

## Where to start

The question I hear most from teams beginning AI adoption is: where do we begin?

My answer now: look at your CLIs first. Not which model to use, not which agent tool to buy, not how to write better prompts. Can an agent run `invoke -l` on your project and understand what it can do? Can it execute a deployment without you explaining each step?

If yes, you're closer than you think. If no, that's the work — and it pays off for your human engineers too, not just for the agents.

The interface was always the investment. It just turned out to have three consumers, not two.

</div>

<div class="lang-zh" markdown="1">

# 三个消费者，一个接口

当我写[统一 CLI 接口](https://nicholas.ren/2024/10/19/unified-interface-for-developer-and-build-pipeline.html)和[用 pyinvoke 做任务自动化](https://nicholas.ren/2024/11/25/using-pyinvoke-for-task-automation.html)的时候，我解决的是开发体验问题。同一个 `invoke deploy --env=staging` 应该在本地和 CI 上都能跑。不能有分歧，不能出现"在我机器上是好的"。

我没想到的是：这个接口还有第三个消费者。只是我当时还没遇到它。

---

## 入职的困境——无论是人还是别的什么

新工程师加入团队。第一天，他们对代码库、规范、以及任何东西怎么部署一无所知。AI agent 在每次新会话开始时也是如此。

体验也很相似：两者都会翻 README、从文档里拼凑 shell 命令、摸索前行，直到有人告诉他们正确的操作方式。

对新工程师的解法是一个好的 CLI。`invoke -l` 打印出项目知道怎么做的所有事情。每个任务都有描述。参数是显式的。不需要考古。你不需要理解整个代码库——你只需要知道哪些命令存在，以及它们做什么。

这也恰好是 AI agent 需要的。

---

## 规模化的入职

未来的工程团队不会全是人。我们正在走向混合团队——一些人类，许多 agent。比例因团队而异，但方向是清晰的。

这些 agent 有两种形态——至少，这是我预期它会如何发展的。一些是**长期存在的**——作为持久的团队成员，随着时间积累上下文，学习规范，与人类并肩工作数月。另一些是**临时性的**——按需启动，执行特定任务，零先验上下文，要求立即投入使用，完成后即丢弃。我对细节可能判断有误。但方向足够清晰，值得为此做准备。

两者都需要入职。但约束条件不同。

对于长期存在的 agent，入职和新工程师很像：慢慢熟悉代码库，吸收规范，了解团队运作方式。好的 CLI 有帮助——第一天运行 `invoke -l`，就能得到和人类新员工一样的项目导览。

对于临时性 agent，没有熟悉期。它带着任务到来，必须在几秒内完成自我定向，而不是几天。它没法被人手把手带着读 README 或 wiki 入职清单。CLI 在这里不是一个便捷的捷径——它是唯一可行的路径。

这对投资回报率的影响很显著。在一个全人类的八人团队里，开发体验投入摊销在八个工程师和他们的离职率上。在一个四人加十个 agent 的混合团队里——有些长期存在，有些每天启动——同样的投入摊销在项目生命周期内每一次 agent 实例化上。回报不是线性增长的，它随团队构成而复利累积。

这个团队里的人类也在做不同的事情。他们不在跑部署或诊断故障——那是 agent 的活。他们在做决策：构建什么、结果是否正确、何时发布。CLI 是决策层和执行层之间的契约。双方都需要它足够清晰。

---

## 可发现性是关键

让 CLI 对 agent 友好的不只是"它是一个命令"，而是它是*可发现的*。

agent 可以运行 `invoke -l`，在几秒内得到项目能力全貌：

```
invoke test                    运行单元测试
invoke package --version=X     构建并打标签 Docker 镜像
invoke publish --version=X     推送镜像到镜像仓库
invoke deploy --env=X          部署到目标环境
invoke smoke-test --env=X      运行部署后验证
```

不需要读文档，不需要 grep 脚本。接口是自描述的。

对比一个任务散落在 bash 脚本、pipeline YAML 和很久没更新过的 README 里的代码库。agent 虽然可以应对——但它被迫去探索、推断、猜测。每一次委托都要先走一段探索阶段，才能开始真正的工作。出错的概率更高，浪费的上下文在有用的事情发生之前就先烧掉了 token。

---

## 让隐性知识变成可执行的

CLI 投入能在 AI 落地上产生回报，还有一个更深层的原因。

在大多数团队里，真正知道事情怎么运作的知识住在人的脑子里。那个知道周五部署到生产环境要加哪个 `--flag` 的资深工程师。那个绕过不稳定集成测试的方法。数据库迁移的正确操作顺序。

写好 `invoke` 任务，会迫使这些知识从脑子里出来，变成可执行的形式。任务变成一个小的、有主见的制品——*这个团队*就是这样做这件事的。

这正是 AI agent 能直接使用的那种知识。不是关于部署的通用知识，而是*你们团队的具体做法*。CLI 是知识结晶的地方。

---

## 委托变得自然

实际的回报体现在工程师把工作交给 agent 的方式上。

以前："你能帮我把 1.4.2 版本部署到 staging 吗？你需要先构建 Docker 镜像，然后推送，然后更新 manifest 并应用——哦，还要检查冒烟测试是否通过。"

现在："运行 `invoke package --version=1.4.2`，然后 `invoke publish`，然后 `invoke deploy --env=staging`，然后 `invoke smoke-test --env=staging`。"

第二种几乎不算是 prompt。它是一串定义明确的操作，agent 可以执行、观察并汇报。工程师不需要解释 CLI 已经编码在内的上下文。

这也是统一接口的理念如何扩展到 AI 的。同样的原则——让开发者能在推到 CI 之前在本地运行 `./go deploy --local`——现在让 agent 也能用相同语义执行相同命令。同一个接口，第三个消费者。

等到这个"之后"的序列反复出现——对于常规部署来说，它一定会——就值得再进一步：把它提取成一个项目级 agent skill。

```markdown
# .agents/skills/deploy/SKILL.md
将服务的某个版本部署到指定环境。
当被要求发布或部署版本时使用。
步骤：invoke package → invoke publish → invoke deploy → invoke smoke-test。
```

现在工程师的指令压缩成：「把 1.4.2 部署到 staging。」agent 调用 skill，skill 执行序列，工程师收到汇报。不需要重复提示，不需要回忆正确顺序。CLI 提供了原材料；skill 是菜谱。

这是开始把工程师从重复执行中解放出来、转向真正需要人的决策的那个循环——发什么、什么时候发、结果够不够好。

---

## 渐进披露

CLI 封装之所以有效——对人类和 agent 都是——是因为它是渐进披露的一个实例。

Anthropic 的 agent skill 规范将此明确列为设计原则：默认情况下，上下文中只保留 skill 描述；只有当 agent 判断某个 skill 相关时，才按需加载完整的 skill 内容。目标是保持上下文窗口的专注——暴露决策所需的内容，其余的延迟加载。

结构良好的 CLI 在工具层做的是同一件事，低一个层次：

`invoke -l` ——能力全貌。能做什么，每个任务一行描述，没有实现细节。足以知道有什么、该往哪走。

`invoke deploy --help` ——接口。参数、标志、期望值。只有在你决定要执行某个特定任务时才加载这一层。

任务内部的实现——代码、逻辑、已经编入的决策。人类和 agent 都不需要读这些才能使用任务。这就是封装的意义。

Agent skill 遵循同样的模式，在上面再加一层：

```
CLI:
  invoke -l              →  有什么          （始终可用）
  invoke deploy --help   →  怎么用          （按需加载）
  invoke deploy --env=X  →  执行

Skills:
  skill 描述列表         →  有什么          （始终在上下文中）
  SKILL.md 内容          →  怎么编排        （相关时加载）
  工具调用/CLI 调用       →  执行
```

agent 始终持有 skill 名称和一行描述——足以判断相关性。完整的 `SKILL.md` 只在 skill 适用时加载。skill 内部的工具调用和 CLI 命令是实现细节，在执行时触发，不会占用推理过程的上下文。

同一种架构，两个层次。默认浅而有索引；只在需要时深入。

被管理的约束是上下文。太早引入太多细节会把真正的任务挤走——无论是一个试图在新项目上摸索的工程师，还是上下文窗口有限的 agent。渐进披露在每一层都通过在正确的时机暴露正确的抽象层次来解决这个问题。

---

## 实践中意味着什么

如果你想改善团队的 AI 落地，一个好的起点不是 AI 工具本身。

是 CLI。

几个具体的例子：

**入职——无论是人还是 agent。** 不再是 15 步的 wiki 配置页，而是 `CLAUDE.md` 里的一行：*"运行 `invoke -l` 查看这个项目能做什么。"* 这一行就给了 agent——或者新工程师——上手所需的一切。不需要考古，不需要过时的文档。CLI 就是入职文档。

**本地复现 CI 失败。** 构建变红了。以前的路：读流水线日志，搞清楚哪个脚本失败了，手动重建环境，再迭代。新的路：告诉 agent「部署步骤在 CI 里失败了，在本地复现它。」因为 `invoke deploy --env=staging` 在 CI 和本地跑的是同一份代码，agent 可以立刻开始缩小故障范围。同一个接口，同样的语义，可复现。

**常规发布，不需要手把手。** 新版本切出来了。「把 1.5.0 打包、发布、部署到 dev，跑冒烟测试，告诉我是否通过。」agent 执行序列，汇报结果。工程师审查，决定是否晋升到 staging。执行交给 agent；决策留给人。

**按需故障诊断。** 生产环境有些不对劲。`invoke peek-a-order` 快速给出系统状态快照。「跑 peek-a-order，总结一下有什么异常。」agent 返回结构化观察。工程师更快得到信号，不需要回忆该按什么顺序跑哪些命令。

在所有这些场景里，CLI 完成了编码*如何做*的工作。工程师专注于*做什么*和*要不要做*。

那些多年来在自动化工具上投入的工程师，发现 AI 落地出奇地顺滑。这不是巧合。他们在知道 agent 要来之前，就已经在构建 agent 接口了。

---

## 从哪里开始

我从开始 AI 落地的团队那里听到最多的问题是：我们从哪里入手？

我现在的答案：先看你的 CLI。不是用哪个模型，不是买哪个 agent 工具，不是怎么写更好的 prompt。agent 能对你的项目运行 `invoke -l` 并理解它能做什么吗？它能在不需要你逐步解释的情况下执行一次部署吗？

如果能，你已经比你想象的走得更远了。如果不能，那就是要做的工作——而且对你的工程师同样有回报，不只是对 agent。

这个接口一直都是那笔投入。只是结果是有三个消费者，不是两个。

</div>
