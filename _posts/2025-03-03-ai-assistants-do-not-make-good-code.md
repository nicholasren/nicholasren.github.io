---
layout: post
title: "AI Assistants Do Not Make Good Code"
comments: true
---
AI Assistants Do Not Make Good Code

Introduction

AI-powered coding assistants churn out code fast, but speed isn’t everything. They lack structural depth, often leading to duplication and unclear class responsibilities. Instead of refining domain models, they generate isolated, surface-level solutions. Engineers, however, should absorb domain knowledge, create meaningful abstractions, and produce richer models with less code.

AI’s Failure in Domain Modelling

Shallow Understanding of Domain Models

AI assistants predict patterns but don’t understand the context. The result? Code that works but is bloated and repetitive. They miss opportunities to introduce domain-driven concepts, instead generating scattered methods that fail to encapsulate business logic.

For example, when asked to generate customer order methods, an AI might create multiple similar functions instead of abstracting common behaviors into a well-structured class. This increases redundancy and makes maintenance harder.

Duplication & Overlapping Responsibilities

AI-generated code frequently duplicates logic across multiple places, adding unnecessary complexity. A human engineer, recognising patterns, would extract shared behaviours into reusable components, making the system more coherent and maintainable.

Imagine an AI assistant generating separate classes for customer validation, order processing, and payment handling. While this might seem fine at first, behaviours often overlap. A skilled engineer would unify related responsibilities to avoid unnecessary fragmentation.

Code Without Concepts = More Maintenance

Good software design isn’t just about functionality—it’s about meaningful abstractions that reduce complexity over time. AI assistants prioritize immediate results over long-term maintainability. Without a solid domain model, logic becomes fragmented, and minor changes require modifying multiple sections of code, increasing the risk of bugs.

How Engineers Should Approach It

Absorb the Domain Knowledge

Great engineering starts with understanding the problem space. Developers should engage with domain experts, study business logic, and identify core concepts. This leads to more meaningful abstractions and intuitive code.

Introduce Richer Concepts & Abstractions

Instead of accepting AI-generated boilerplate, engineers should focus on designing models that encapsulate core behaviors.

For example, rather than separate, redundant order-handling methods, a well-designed system might introduce an "Order" domain object to encapsulate common logic. This reduces duplication and makes the system easier to extend.

Conclusion

AI coding assistants are useful for quick snippets, but they don’t produce maintainable software. They fail to distill domain models, leading to duplication, overlapping responsibilities, and bloated codebases. Engineers must take ownership of design, prioritising deep understanding and meaningful abstractions. The goal isn’t just working code—it’s better code.
