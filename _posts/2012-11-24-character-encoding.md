---
layout: modern-post
title: "Character Encoding"
date: 2012-11-24
tags: [software-development, programming]
description: "A blog post about character encoding and software development."
share: true
comments: true
---

### Character encoding

ASCII   
	
  * encoding in 7-bit. 
  * 32 -> 127 representing characters.
  * 0 ->  31 representing control characters.
  * 128 -> 255 was called  OEM characters, many company has their own idea about how to use these charaters.

ANSI:

  * lower 127 characters is same with ASCII.
  * higher 127 characters were divided into different "code pages"

Unicode:

  * Code point: In Unicode, a letter maps to something called a code point which is still just a theoretical concept.   
  * Encoding: Unicode Byte Order Mark: indicating encoding order is 'high-endian' or 'low-endian' 
  
UTF8: Every code point from 0-127 is stored in a single byte. Only code points 128 and above are stored using 2, 3, in fact, up to 6 bytes.


### The Most Important thing:
      It does not make sense to have a string without knowing what encoding it uses. 

