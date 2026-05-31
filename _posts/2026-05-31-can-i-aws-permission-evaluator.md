---
layout: modern-post
title: "Can I? An Interactive AWS Permission Evaluator"
date: 2026-05-31
tags: [aws, iam, security, tools, interactive]
description: "AWS authorization has a handful of corners everyone gets wrong. So I built an interactive evaluator that animates a request through every gate — SCP, RCP, identity policy, permission boundary, resource policy, and KMS — and shows you exactly where it stops."
comments: true
share: true
---

<div class="lang-en" markdown="1">


Every so often someone on the team asks the same question in a slightly different shape: *"Why can't this role read that bucket?"* *"Will this Lambda be allowed to write to the table?"* *"We added the bucket policy — why is it still AccessDenied?"*

The answer is almost always hiding in the interaction between **six** things: the [IAM identity policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html#policies_id-based), the [permission boundary](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html), the [resource-based policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html#policies_resource-based), the [SCP](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html), the [RCP](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_rcps.html), and — for encrypted resources — the [KMS key policy](https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html). Each one can independently sink a request, and a few of them interact in ways that are genuinely counterintuitive.

I'd written all of this up as notes. But a wall of rules is hard to internalise, so I turned it into something you can poke at:

**[→ Try the evaluator](/aws-permission-evaluator/)**

## What it does

You set the scenario with toggles — service, same-account vs cross-account, encryption, and the state of each policy — and the page draws a live diagram of the request. Nested boxes are policy scopes: SCP and RCP wrap the account, the permission boundary and the identity / resource policies wrap the principal and the resource. Press **Run request** and a dot travels from the role to the resource and stops, pulsing, at the exact gate that decides the outcome. A gate-by-gate table and a one-line "deciding rule" explain why.

It's deliberately a teaching tool. The fun is in flipping one switch and watching the verdict change.

## The corners worth playing with

A few scenarios are worth setting up yourself, because they're the ones people get wrong:

- **Implicit vs. explicit deny in a permission boundary.** Same-account, a resource-policy grant *overrules* an implicit deny in the boundary (the action simply isn't in its allow set) — but it can never override an explicit `Deny`. Flip the boundary between "Silent" and "Explicit Deny" and watch the verdict flip with it.
- **Cross-account needs both sides.** Same-account is generous: an IAM Allow on the role is often enough. Cross-account is not — you need an IAM Allow *and* a resource-policy grant. The diagram makes this physical: the request has to clear a gate on *each* side of the account gap.
- **`aws/s3` can't go cross-account.** The AWS-managed S3 key silently makes cross-account access impossible. Set it up and the evaluator calls it out.
- **A CMK is deny-by-default.** Same-account buys you nothing with a customer-managed KMS key — the principal has to be enumerated in the key policy. IAM alone never unlocks it.
- **SCPs and RCPs can't be bypassed.** A resource-policy grant can paper over an implicit boundary deny, but never an SCP or RCP block.

## Why a diagram and not a blog post

I could have published the rules as prose — I nearly did. But authorization is a *path*: a request either makes it through every gate or it doesn't, and the interesting part is always *which* gate stopped it. A diagram that animates that path teaches the mental model in a way a table never quite does. The underlying logic is the same one I packaged as a reusable agent skill; this is just its friendlier, clickable face.

If you find a scenario it gets wrong, I'd love to hear about it.

</div>

<div class="lang-zh" markdown="1">

# Can I？一个交互式 AWS 权限评估器

团队里总会有人换着花样问同一个问题：*"为什么这个角色读不了那个S3 Bucket？"* *"这个 Lambda 能写DynamoDB Table吗？"* *"Bucket Policy都加了——怎么还是 AccessDenied？"*

答案几乎总是藏在**六样东西**的相互作用里：IAM 身份策略、权限边界（permission boundary）、基于资源的策略、SCP、RCP，以及——对加密资源而言——KMS 密钥策略。它们中任何一个都能独立地让请求失败，而其中几个之间的相互作用，确实违反直觉。

这些我本来都写成了笔记。但一堆规则很难真正记住，所以我把它做成了一个可以动手玩的东西：

**[→ 试试这个评估器](/aws-permission-evaluator/)**

## 它能做什么

你用开关设定场景——服务、同账户还是跨账户、加密方式，以及每个策略的状态——页面就会实时画出这次请求的示意图。嵌套的方框代表策略的作用域：SCP 和 RCP 包住账户，权限边界与身份／资源策略分别包住主体和资源。点 **Run request**，一个小点会从角色出发走向资源，并在决定结果的那道"门"上停下、闪烁。下面的逐项表格和一句"决定性规则"会解释原因。

它就是个教学工具。乐趣在于：拨动一个开关，看着结论随之翻转。

## 值得亲手试的几个角落

有几个场景特别值得自己搭一遍，因为它们正是最容易搞错的：

- **权限边界里的隐式 vs 显式拒绝。** 同账户下，资源策略的授予可以*盖过*边界里的隐式拒绝（动作只是不在它的允许集合里）——但永远盖不过显式 `Deny`。把边界在"Silent"和"Explicit Deny"之间切换，结论会随之翻转。
- **跨账户需要两边都同意。** 同账户很宽容：角色上的 IAM Allow 往往就够了。跨账户不行——既要 IAM Allow，又要资源策略授予。示意图把这一点变得很直观：请求必须在账户间隙的*两侧*各过一道门。
- **`aws/s3` 无法跨账户。** AWS 托管的 S3 密钥会悄悄让跨账户访问变得不可能。把它设上，评估器会直接指出来。
- **CMK 默认拒绝。** 用客户托管的 KMS 密钥时，同账户也占不到便宜——主体必须在密钥策略里被显式列出。光有 IAM 永远打不开它。
- **SCP 和 RCP 绕不过去。** 资源策略的授予能糊住边界的隐式拒绝，却永远绕不过 SCP 或 RCP 的封锁。

## 为什么用示意图，而不是写一篇博客

我本可以把规则写成文字——其实差点就那么做了。但授权本质上是一条*路径*：一个请求要么过了每一道门，要么没过，而有意思的永远是*哪一道*门把它拦下了。一张能把这条路径动起来的图，能把这套心智模型讲清楚，这是表格做不到的。背后的逻辑，和我打包成可复用 agent skill 的那套是同一套；这只是它更友好、可点击的一面。

如果你发现哪个场景它算错了，欢迎告诉我。

</div>
