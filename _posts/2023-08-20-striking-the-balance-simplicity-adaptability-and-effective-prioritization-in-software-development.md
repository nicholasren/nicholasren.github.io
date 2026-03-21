---
layout: modern-post
title: "Striking the Balance: Simplicity, Adaptability, and Effective Prioritization in Software Development"
date: 2023-08-20
tags: [software-development, project-management, technical-debt, prioritization, best-practices]
description: "Exploring the delicate balance between local optimization and system-wide thinking, effective prioritization strategies, and when to consider rewriting vs. refactoring."
comments: true
share: true
---

<div class="lang-en" markdown="1">

# Striking the Balance

A few patterns keep showing up in the projects I've worked on. They're not new ideas, but they're easy to forget when you're deep in delivery. This is my attempt to write them down.

---

## Local optimisation and its consequences

There's a category of mistake that's easy to make and hard to see while you're making it: optimising one dimension of a system so aggressively that the costs land somewhere else entirely.

I saw this play out in a backup solution. The team put serious effort into making backups immutable — genuinely hard to tamper with, even under adversarial conditions. The threat model was thorough: stolen credentials across multiple actors, intentionally introduced bugs, coordinated attacks. The engineering was solid. For that specific goal, it worked.

But the friction spread well beyond the backup system itself. Routine operator tasks required multi-party approval — the kind of overhead that's reasonable for a production database change, but grinding when you're just running a scheduled job. Blanket SCPs put in place to prevent backup mutation ended up blocking operations in other teams who had nothing to do with backups. The policies weren't scoped tightly enough, and the blast radius was wider than anyone intended.

The backup immutability was a real goal. But the optimisation was scoped to one metric — "how hard is it to corrupt a backup?" — without accounting for what it cost everything around it.

That's the trap of local optimisation: the thing you're measuring improves, and everything else quietly gets worse.

---

## Scoping, prioritisation, and knowing when to re-prioritise

Prioritisation only works if the scope is clear. Without it, the work expands to fill whatever time is available — and often more.

A common version of this: a team sets aside a sprint to pay down technical debt. No clear boundaries on what's in scope. The first day, someone fixes a known issue. The second day, they notice something adjacent. By the end of the sprint, half a dozen things are half-done and nothing has shipped. The sprint ends with more work in progress than when it started.

The problem isn't that the team worked on tech debt. It's that they treated it differently from feature work — without a defined scope, a clear "done," or any mechanism to stop. Debt work needs the same discipline as everything else: a specific goal, a boundary around it, and a way to know when you've hit it.

The other side of this is being willing to re-prioritise when the context changes. Sticking rigidly to a plan that was made with last month's information isn't discipline — it's inertia. The teams I've seen handle this well treat re-prioritisation as a normal part of the process, not an admission of failure. They make it fast, they make it visible, and they move on.

---

## When to consider a rewrite

Refactoring is usually the right call. But not always.

There's a particular failure mode I've seen more than once: a configuration system that starts simple and grows into something nobody fully understands. It begins as a YAML file with a few knobs. Then someone adds conditional logic. Then environment-specific overrides. Then a templating mechanism. Then escaping rules for the templating mechanism. Eventually you're debugging logic in YAML, and the "config file" has become an untyped programming language with no editor support, no tests, and no debugger.

At that point, refactoring is the wrong tool. Each refactor touches a system where the behaviour isn't fully understood and isn't tested. You're as likely to introduce bugs as fix them. A rewrite — with a proper DSL, or a real scripting layer, or just a clearly defined data format — is cheaper in the long run than continuing to patch something that was never designed for what it became.

The signal that a rewrite is worth considering isn't age or size. It's when the cost of understanding the existing system exceeds the cost of rebuilding it with what you now know. That's a judgement call, and it's often made too late.

---

## Simplicity over flexibility

The instinct to build flexibly is understandable. Requirements change. You don't want to paint yourself into a corner. So you add extension points, plugin hooks, generic interfaces — designing for the use cases you don't have yet.

The problem is that flexibility has a cost, and it's paid upfront. Every abstraction layer is something the next engineer has to understand before they can change anything. Every extension point is a place where behaviour becomes implicit rather than explicit. The system becomes harder to reason about, not easier.

I've seen this in internal frameworks built to be reusable across teams. The intention is good: write it once, use it everywhere. But the framework has to be generic enough to serve every possible consumer, which means it can't be optimised for any of them. Teams end up building adapters on top of the framework to make it work for their specific case — which is exactly what they were trying to avoid.

The simpler version — written for the actual use case, not the hypothetical one — would have been easier to change when requirements shifted. Flexibility in a system often creates rigidity in its consumers.

Prefer the simpler design. Handle the actual problem in front of you. If the requirements change in a way that breaks the design, refactor then — with real information instead of speculation.

---

None of these are new ideas. The hard part is remembering them when you're in the middle of a deadline and the tempting option is right in front of you.

</div>

<div class="lang-zh" markdown="1">

# 找到平衡点

这些模式在我经手的项目里反复出现。不是什么新想法，但深陷交付压力的时候很容易忘记。写下来，算是给自己备忘。

---

## 局部优化及其代价

有一类错误很容易犯，犯的时候却很难察觉：对系统某一个维度的优化过于激进，代价却悄悄转嫁到了其他地方。

我在一个备份系统里亲眼见过这个情形。团队在备份不可变性上投入了极大的精力 —— 要让备份真的难以篡改，即便面对复杂的攻击场景也一样：跨多个角色的凭证窃取、蓄意引入的系统漏洞、协同攻击。工程实现很扎实，针对这个目标，它确实做到了。

但摩擦远远蔓延到了备份系统之外。运维的日常操作需要多方审批 —— 这种开销用在生产数据库变更上是合理的，但用在跑一个定时任务上就是折磨。为防止备份被篡改而设置的宽泛 SCP，把那些和备份毫无关系的团队的操作也一并拦截了。策略的边界划得不够精准，波及范围远超预期。

备份不可变性是个真实的目标。但这个优化只盯着一个指标 —— "备份有多难被篡改？" —— 而没有算清楚它给周围一切带来了什么代价。

这就是局部优化的陷阱：你在意的那个数字变好了，其他一切在悄悄变差。

---

## 范围、优先级，以及何时重新排序

优先级只有在范围清晰的前提下才有意义。没有边界，工作会自动膨胀填满所有可用的时间 —— 甚至更多。

一个常见的版本：团队划出一个 sprint 专门还技术债。没有明确的范围边界。第一天，有人修了个已知问题。第二天，发现了旁边的另一个问题。到 sprint 结束时，六件事各做了一半，没有任何东西交付。这个 sprint 结束时，在途工作比开始时还多。

问题不在于团队在还债。问题在于他们用对待技术债的方式，而不是对待功能开发的方式来处理它 —— 没有明确的范围，没有清晰的"完成"定义，也没有任何叫停机制。还债工作需要和其他所有工作一样的纪律：一个具体的目标，一条围绕它的边界，以及一个知道自己到没到的方式。

另一面是：当上下文变了，要愿意重新排序。死守着用上个月的信息制定的计划不是纪律，是惰性。我见过处理得好的团队，他们把重新优先排序当作流程的正常组成部分，而不是失败的承认。快速做，公开做，然后继续前进。

---

## 什么时候该考虑重写

重构通常是正确的选择。但不总是。

有一种失败模式我见过不止一次：配置系统一开始很简单，慢慢长成了没人完全理解的东西。起初是一个有几个开关的 YAML 文件。然后有人加了条件逻辑。然后是针对不同环境的覆写。然后是模板机制。然后是模板机制的转义规则。最终你在 YAML 里调试业务逻辑，而那个"配置文件"已经变成了一门没有编辑器支持、没有测试、没有调试器的无类型编程语言。

到了这一步，重构是错误的工具。每次重构都在触碰一个行为没有被完全理解、也没有被测试的系统。你引入 bug 的概率和修复 bug 的概率差不多。重写 —— 用一个合适的 DSL，或者真正的脚本层，或者一个定义清晰的数据格式 —— 从长远来看，比继续给一个从未为此而设计的东西打补丁要便宜得多。

判断是否值得重写的信号，不是年龄或规模。而是当理解现有系统的成本，超过了用你现在掌握的知识重建它的成本。这是一个判断题，而且往往做得太晚。

---

## 简单优于灵活

想把东西做得灵活，这种冲动是可以理解的。需求会变，你不想把自己逼进死角。于是你加了扩展点、插件钩子、通用接口 —— 为那些还不存在的使用场景做设计。

问题是灵活性有代价，而且是预付的。每一层抽象，都是下一个工程师在改任何东西之前必须先理解的东西。每一个扩展点，都是行为从显式变为隐式的地方。系统变得更难推理，而不是更容易。

我在跨团队复用的内部框架上见过这个情形。出发点是好的：写一次，到处用。但框架必须足够通用才能服务所有可能的使用方 —— 这意味着它无法为其中任何一个做优化。各团队最终在框架上面再包一层适配器，让它能用于自己的具体场景 —— 而这正是他们当初想避免的事情。

更简单的版本 —— 为真实的使用场景而写，而不是假想的 —— 当需求变化时反而更容易调整。系统层面的灵活性，往往造成使用方层面的僵化。

选更简单的设计。处理眼前真实的问题。如果需求变了以至于设计撑不住了，到时候再重构 —— 用真实的信息，而不是猜测。

---

都不是新想法。难的是在截止日期压着、诱人的选项就摆在面前的时候，还能记得它们。

</div>
