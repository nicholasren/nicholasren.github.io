---
layout: modern-post
title: "Research on Autopilot"
comments: true
---
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
