---
layout: modern-post
title: "Research on Autopilot"
title_zh: "自动驾驶式调查"
comments: true
---

<div class="lang-en" markdown="1">

# Research on Autopilot: How I Use AI Agents to Investigate Without Getting Stuck in the Weeds

  There's a version of using AI that many engineers are stuck on: the back-and-forth assistant. You ask it to write a function. It gives you one. You tweak it, paste it, run it, come back. Rinse, repeat. It's useful — but it still puts *you* in the driver's seat for every single step.

  A while back I started experimenting with a different mode. Instead of treating the AI as a faster Google or a better autocomplete, I started treating it like a partner I could hand an investigation to — one that would handle the tedious legwork, track its own progress, and come back to me when it actually needed a human brain in the loop.

  The idea is simple: put the investigation on autopilot, and free yourself up to think.

---
## How It Works

  The approach comes down to three things:

  **1. Start with a rich, structured context.** Before you hand anything off, write down your problem definition, your current hypothesis, and the directions you want the agent to explore. The quality of your upfront context is the single biggest lever on how useful the agent ends up being. Don't be vague. If you're investigating a bug, include what you've already ruled out. If you're testing a hypothesis, write the hypothesis down like a scientist would.

  **2. Give the agent a mandate to run, not just respond.** The difference between a chatbot and a proper investigation partner is autonomy. A partner has permission to execute scripts, check logs, spin up environments, make observations, and iterate — without asking you at every step. You're not removing yourself from the loop; you're raising the threshold for when your input is needed.

  **3. Ask the agent to maintain a running summary and surface you at key moments.** Long investigations have a lot of noise. Ask the agent to keep a progressive log of what it's tried, what it found, and what it's doing next — and to explicitly flag you when something interesting happens: a test passes unexpectedly, an error changes character, a pattern emerges. You shouldn't have to babysit the investigation. You should be pulled in when there's something worth deciding.

  That last line is the whole idea: you get pulled in when there's something worth deciding, not for every step in between.

---
## Example: Hunting Down Backup Failures

  Here's where this clicked for me. I was trying to understand why certain backup jobs were failing intermittently. The testing cycle was genuinely painful:

	1. Set up an S3 bucket populated with many objects
	2. Make a configuration change — bucket policy, KMS key, bucket notifications, object versioning, etc.
	3. Upload or delete some objects
	4. Wait for the next scheduled backup job to run
	5. Observe job status
	6. Trigger a restore and verify the result
	7. Repeat from step 1, with a different config combination

Ten rounds of this. Every round had waiting involved. Before AI agents, I had a notebook full of CLI commands. I eventually scripted it, which made it repeatable — but I was still the one watching the terminal, rerunning things, taking notes. Still glued to the process.

With the investigation on autopilot, the workflow looked completely different. I wrote a context doc: the problem statement, the relevant config knobs, what failure looked like, what I'd already tried. Then I asked the agent to generate scripts for each phase of the test loop. I gave it permission to execute them in the test environment. I asked it to watch for observable outcomes — job completion, restore verification, error codes — and notify me when something happened worth looking at.

Then I went and did other work.

The agent ran the cycle, kept a running log, and flagged me when a restore failed with an unexpected error. I came back, looked at its summary, made a hypothesis about the root cause, updated the context, and sent it back on another round. What used to take me half a day of focused attention became something I could run in the background while staying in flow on other things.

One small touch that made it feel surprisingly alive: I asked the agent to use the macOS `say` command to announce what happened at each checkpoint. So instead of checking back manually, I'd just hear a voice from my laptop — *"Restore completed successfully"* or *"Job failed with error code 403"* — while I was in the middle of something else. It sounds like a gimmick, but it genuinely changed how I related to the process. The investigation was running alongside me, not waiting for me.

---

## The Mental Shift

  The hardest part of working this way isn't technical. It's the impulse to stay in the loop every step of the way.

  Engineers are trained to be hands-on. We want to see the output of every command. We want to catch things before they go wrong. The idea of an agent running ten test cycles while we're in a different meeting feels uncomfortable — like we're losing visibility.

  But what you're actually doing is *trading low-value visibility for high-value attention*. You don't need to watch a script run. You need to know when it finishes with something interesting.

  The key enabler is that opening context doc. The more carefully you describe your problem, your hypotheses, and your success criteria upfront, the more confidently you can let the agent run. Poorly scoped investigations with a vague mandate tend to drift. Well-scoped ones with a clear "flag me when X happens" signal tend to converge.

  Set the destination, hand over the controls, and step in when it matters.

---

  *If this resonates — or if you've found your own way of working alongside AI agents — I'd love to hear about it.*

</div>

<div class="lang-zh" markdown="1">

# 自动驾驶式调查：我如何用 AI 智能体在不陷入细节泥潭的情况下进行研究

许多工程师都停留在这样一种使用 AI 的模式里：来回对话式助手。你让它写一个函数，它给你一个。你调整它、粘贴它、运行它，再回来。如此循环。这固然有用——但你依然是每一步的*掌舵人*。

不久前，我开始尝试一种不同的模式。我不再把 AI 当作更快的 Google 或更好的自动补全，而是把它当作一个可以把调查任务交给它的伙伴——它会处理繁琐的基础工作，追踪自己的进展，并在真正需要人类介入时才回来找我。

这个想法很简单：把调查放上自动驾驶，让自己腾出空间去思考。

---
## 它是如何运作的

这个方法归结为三件事：

**1. 从一份丰富、结构化的上下文开始。** 在你把任务交出去之前，把你的问题定义、当前假设，以及你希望智能体探索的方向都写下来。你前期上下文的质量，是决定智能体最终有多大用处的最重要杠杆。不要含糊。如果你在排查一个 bug，把你已经排除的情况列出来。如果你在验证一个假设，像科学家一样把假设写下来。

**2. 给智能体一个执行的授权，而不仅仅是回应。** 聊天机器人和真正的调查伙伴之间的区别在于自主性。一个伙伴有权限执行脚本、检查日志、启动环境、做出观察并迭代——而不需要每一步都问你。你不是把自己从循环中移除；你是在提高需要你介入的门槛。

**3. 让智能体维护一份运行摘要，并在关键时刻通知你。** 长时间的调查有很多噪音。让智能体记录它尝试了什么、发现了什么、接下来要做什么——并在有趣的事情发生时明确通知你：一个测试出乎意料地通过了，一个错误的性质改变了，一个规律出现了。你不应该盯着调查；你应该在有值得决策的事情时被叫回来。

最后那句话就是核心思想：当有值得决策的事情时你才介入，而不是每一个中间步骤都要参与。

---
## 示例：追踪备份失败

这个方法在我身上真正生效的一次经历。我当时试图搞清楚为什么某些备份任务会间歇性地失败。测试周期真的很痛苦：

1. 搭建一个填充了大量对象的 S3 存储桶
2. 做一个配置更改——存储桶策略、KMS 密钥、存储桶通知、对象版本控制等
3. 上传或删除一些对象
4. 等待下一次计划的备份任务运行
5. 观察任务状态
6. 触发一次恢复并验证结果
7. 从第一步重新开始，换一种配置组合

十轮这样的循环。每一轮都有等待。在有 AI 智能体之前，我有一本满是 CLI 命令的笔记本。我最终把它脚本化了，这让它变得可重复——但我仍然是那个盯着终端、重新运行命令、记录笔记的人。仍然被死死绑在流程上。

把调查放上自动驾驶之后，工作流看起来完全不同。我写了一份上下文文档：问题陈述、相关配置项、失败是什么样的、我已经尝试过什么。然后我让智能体为测试循环的每个阶段生成脚本。我授权它在测试环境中执行这些脚本。我让它关注可观察到的结果——任务完成、恢复验证、错误代码——并在有值得关注的事情发生时通知我。

然后我去做别的工作了。

智能体运行了循环，维护了运行日志，并在恢复因一个意外错误失败时通知了我。我回来，看了它的摘要，对根本原因做了一个假设，更新了上下文，然后让它开始新一轮。以前需要我半天专注注意力的事情，变成了我可以在保持专注于其他工作的同时在后台运行的事情。

有一个小细节让整个过程感觉出奇地有生命力：我让智能体在每个检查点使用 macOS 的 `say` 命令来播报发生了什么。所以我不是手动回查，而是在忙着做别的事情时，直接从笔记本电脑里听到一个声音——*"恢复成功完成"*或者*"任务因错误代码 403 失败"*。这听起来像是个噱头，但它真正改变了我与这个过程的关系。调查在我旁边运行，而不是在等待我。

---

## 思维转变

用这种方式工作，最难的部分不是技术层面的。是那种想要在每一步都待在循环里的冲动。

工程师被训练成动手派。我们想看到每个命令的输出。我们想在出错之前捕捉到问题。让一个智能体在我们开会的时候运行十次测试循环，感觉很不舒服——像是在失去可见性。

但你实际上做的是*用低价值的可见性换取高价值的注意力*。你不需要看着一个脚本运行。你需要知道它什么时候结束时有了有趣的发现。

关键的促成因素是那份开篇上下文文档。你越仔细地描述你的问题、你的假设、你的成功标准，你就能越自信地让智能体去运行。范围不清晰、授权模糊的调查往往会漂移。范围清晰、有明确"当 X 发生时通知我"信号的调查往往会收敛。

设定目的地，交出控制权，在重要的时候介入。

---

*如果这篇文章引起了共鸣——或者你找到了自己与 AI 智能体协作的方式——我很想听听。*

</div>
