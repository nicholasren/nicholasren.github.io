---
layout: modern-post
title: "Lessons Learnt in AI Adoption"
date: 2026-03-21
tags: [ai, agents, developer-tools, skills, mcp]
description: "What I've actually found after spending real time with AI coding agents — tool trade-offs, building reusable skills, and the parts I'm still figuring out."
comments: true
share: true
---

<div class="lang-en" markdown="1">

# Lessons Learnt in AI Adoption

I've been working with AI coding agents seriously for a while now. This is a collection of things I've learnt along the way — some of it figured out, some of it still in progress.

---

## Agent skills

The first wave of AI adoption is usually about picking a tool and getting it to do useful things. That part is well-covered elsewhere. What's less talked about is what happens after — once the novelty wears off and you start noticing the same friction every day.

The agent doesn't know your codebase, your conventions, or how your team operates. You end up repeating the same context every session.

This is where agent skills come in. A skill is a reusable artefact the agent can reach for when a recognisable situation arises. The mental model I find useful is a library: you don't copy utilities into every file — you extract them, give them a clean interface, and import them where needed. Skills work the same way. They're packaged knowledge the agent can invoke rather than rediscovering from scratch each time.

To understand how all the pieces fit together, here's a rough picture:

![Agentic AI diagram](/images/agentic-ai-diagram.svg)

The **LLM** reasons and decides — but it doesn't act. The **agent** is the runtime that acts on those decisions. **Tools** are primitive, atomic operations. **Skills** sit above that — they're higher-level processes that can compose multiple tool calls and MCP calls together. That composability is what makes them useful.

The key design idea is *progressive disclosure*. The agent holds a list of skill descriptions — what each skill does and when to use it. The LLM decides which skills are relevant for a given task and loads only those. Everything else stays out of the context window. Same principle as lazy loading.

One thing I got wrong early: I tried to design skills upfront. I'd think of a problem, imagine the skill, write the spec. That didn't work well.

What works better is to start with the actual problem. Collaborate with the agent on solving it. Let it explore the available tools on connected MCPs, build scripts, try approaches. Once a pattern repeats — once you notice the agent reaching for the same sequence of steps — that's when you extract a skill. The skill becomes the distilled version of what you figured out together.

---

## How do I test my skills?

Honest answer: I'm still working this out.

The intuition is clear. A skill is code — or at least structured instructions — and code should be tested. You want to know if it triggers in the right situations, produces useful output, and doesn't regress when you update it.

But the mechanics are harder than unit testing. Skills invoke an LLM, so the same input doesn't always produce the same output. "Testing" a skill is closer to running evals: you define scenarios, run against them, and assess whether the outcomes are *good enough*, not whether they're identical.

I'm currently thinking about it in terms of trigger accuracy (does the agent call this skill when it should?), output quality (is what it produces actually useful?), and regression coverage (do I know if I've broken something after an update?). But I don't have a clean answer on implementation yet.

If you've solved this better than I have, I'd genuinely like to know.

---

## Sharing skills with the team

This one I have a clearer view on, because the software world has already solved the same problem for libraries.

When you write something useful, you don't keep it on your machine. You publish it — versioned with semver, with a clear interface, somewhere the rest of the team can depend on it. A `1.0.0` is stable. A `2.0.0` signals a breaking change. A patch is safe to pick up.

Skills should work the same way. The artifact is the skill folder. The publish step is committing it to a shared repository your team's agents can pull from. When a senior engineer figures out a better way to handle a recurring task, that knowledge shouldn't stay in their session history. It should become a versioned, reviewable skill.

The interesting implication: agent skills are a form of team knowledge — as much as your internal libraries or your runbooks. They deserve the same care. Review them, version them, maintain them.

---

## Managing skills locally

Different tools look for skills in different places. Claude uses `~/.claude/skills`, Cursor uses `~/.cursor/skills`. If you use more than one agent — and most people do — you end up maintaining the same skills in multiple locations. That gets messy fast.

Skills are also shared in different ways. The most common is a git repository you clone. Your team might have one, or you might pull in skills from the community.

My approach: keep a single source of truth at `~/.agents/skills`, and symlink from there into wherever each tool expects to find them.

For project-specific skills, I keep them in the repo itself under `.agents/skills/`, then link them into the central location on setup:

```bash
for skill_dir in $PROJECT_ROOT/.agents/skills/*/; do
  skill_name="$(basename "$skill_dir")"
  ln -snf "$skill_dir" "$HOME/.agents/skills/$skill_name"
  echo "linked: $skill_name"
done
```

This way the skill lives with the project, is versioned alongside the code, and is still accessible to any agent tool on the machine. Updating the skill in the repo automatically updates what the agent sees — no manual syncing.

It's a small thing, but having one place to look makes the whole system feel more manageable.

---

## Where I'm at

The tools will keep changing. The best option today probably won't be the best option in six months.

What's stayed useful is the underlying approach: pick tools based on what they're actually good for, build reusable knowledge rather than starting from scratch every session, and treat your skills like the engineering artefacts they are.

Still figuring a lot of this out.

</div>

<div class="lang-zh" markdown="1">

# AI 落地的那些事

认真用 AI 编程助手已经有一段时间了。这篇文章是一些沿途积累下来的东西 —— 有些已经想清楚了，有些还在摸索。

---

## Agent skill

AI 落地的第一阶段通常是选工具、让它做点有用的事。这部分已经有很多人写过了。较少被提到的是之后发生的事 —— 新鲜感消退之后，你开始每天碰到同样的摩擦。

agent 不了解你的代码库、你的规范、也不知道你团队的工作方式。每次新会话你都得重复一遍相同的上下文。

这就是 agent skill 的用武之地。skill 是一个可复用的制品，agent 在遇到熟悉的场景时可以直接调用。我觉得最顺手的类比是库：你不会在每个文件里复制粘贴工具函数 —— 你把它们提取成库，给个干净的接口，然后按需导入。skill 的工作方式相同。它是打包好的知识，agent 可以直接调用，而不是每次从头摸索。

要理解所有概念如何配合，大致是这样的：

![Agentic AI 架构图](/images/agentic-ai-diagram.svg)

**LLM** 负责推理和决策 —— 但它不直接行动。**agent** 是执行决策的运行时。**工具（tools）** 是原子操作，粒度很细。**skill** 在这之上 —— 它是更高层次的流程，可以把多次工具调用和 MCP 调用组合在一起。这种组合能力是它有用的原因。

关键的设计思路是*渐进披露（progressive disclosure）*。agent 维护一份 skill 描述列表 —— 每个 skill 是什么、什么时候用。LLM 来决定哪些 skill 和当前任务相关，只加载那些。其余的不进入上下文窗口。和懒加载是一个道理。

我早期犯的一个错误：试图提前设计 skill。想好一个问题，构思 skill，写规范。这条路走不通。

更有效的方式是从真实问题出发。和 agent 一起解决它，让它探索连接的 MCP 上有哪些可用工具，写脚本，尝试各种方案。等到一个模式反复出现 —— 等到你发现 agent 总是在重复相同的操作序列 —— 那才是提取 skill 的时机。skill 是你们一起摸索出来的成果的精华版。

---

## 怎么测试 skill？

实话实说：我还在摸索。

直觉上很清楚。skill 是代码 —— 或者至少是结构化的指令 —— 而代码应该被测试。你想知道它是否在正确的场景下触发、产出是否有用、更新之后是否有回归。

但具体怎么做比单元测试难得多。skill 会调用 LLM，同样的输入不一定每次产出一样的结果。"测试" skill 更接近跑 eval：你定义一组场景，跑过去，评估结果是否*足够好*，而不是是否*完全一致*。

我现在大致从三个维度来思考：触发准确性（agent 该调用的时候调用了吗？）、输出质量（产出的东西真的有用吗？）、回归覆盖（改了 skill 之后我能知道有没有搞坏什么？）。但在实现层面还没有清晰的答案。

如果你有更好的解法，我真的很想听。

---

## 怎么在团队里共享 skill？

这个我看得更清楚一些，因为软件世界对同样的问题已经有了解法。

写了有用的东西，你不会留在自己机器上。你发布它 —— 用 semver 版本化，有清晰的接口，放在团队可以依赖的地方。`1.0.0` 是稳定版。`2.0.0` 意味着破坏性变更。补丁版本可以安全升级。

skill 应该以同样的方式运作。制品是 skill 文件夹。发布就是把它提交到团队 agent 可以拉取的共享仓库。当一个资深工程师摸索出处理某类重复任务的更好方法，这个知识不应该停留在他的会话历史里。它应该成为一个有版本、可审查的 skill。

这里有个值得关注的含义：agent skill 是一种团队知识 —— 和你的内部库、你的 runbook 一样。它们应该得到同等的对待。review 它们，给它们版本，维护它们。

---

## 本地管理 skill

不同的工具在不同的地方找 skill。Claude 用 `~/.claude/skills`，Cursor 用 `~/.cursor/skills`。如果你同时用多个 agent —— 大多数人都这样 —— 你就得在多个地方维护同一套 skill。很快就会乱。

skill 的共享方式也各不相同。最常见的是一个 git 仓库，clone 下来就用。团队可能有一个内部仓库，你也可能从社区拉一些。

我的方案：在 `~/.agents/skills` 维护一份单一来源，然后从这里软链接到各个工具期望的位置。

对于项目相关的 skill，我把它们放在仓库里的 `.agents/skills/` 下，然后在环境初始化时链接到中央位置：

```bash
for skill_dir in $PROJECT_ROOT/.agents/skills/*/; do
  skill_name="$(basename "$skill_dir")"
  ln -snf "$skill_dir" "$HOME/.agents/skills/$skill_name"
  echo "linked: $skill_name"
done
```

这样 skill 跟着项目走，跟代码一起版本化，同时对机器上的任何 agent 工具可见。在仓库里更新 skill，agent 看到的立刻就更新了 —— 不需要手动同步。

细节，但有了这个，整个体系感觉清晰多了。

---

## 现在到哪了

工具会一直变。今天最好的选择，六个月后未必还是。

一直有用的是底层的思路：根据工具真正擅长的场景选工具，积累可复用的知识而不是每次从头开始，把你的 skill 当工程制品来对待。

很多东西还在摸索。

</div>
