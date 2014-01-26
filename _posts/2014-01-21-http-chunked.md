---
layout: post
title: "a random http failure caused by http chunked transfer encoding"
---

Recently, I encounter a issue which can only be repoduced on QA environment, which caused by http chunked transfer encoding and an in proper http client code. In this post, I'm going to share with you about how we f