---
layout: modern-post
title: "Photos"
permalink: /photos/
description: "Photographs."
share: false
comments: false
---

<style>
.photo-sets {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px;
  margin: 2rem -1rem;
}

.photo-set-card {
  position: relative;
  overflow: hidden;
  background: #111;
  aspect-ratio: 3/2;
  display: block;
  text-decoration: none;
}

.photo-set-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.3s ease, transform 0.4s ease;
}

.photo-set-card:hover img {
  opacity: 0.6;
  transform: scale(1.03);
}

.photo-set-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem 1.25rem 1rem;
  background: linear-gradient(transparent, rgba(0,0,0,0.75));
  color: #fff;
  transition: opacity 0.3s;
}

.photo-set-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.2rem;
  letter-spacing: 0.02em;
}

.photo-set-date {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

@media (max-width: 600px) {
  .photo-sets {
    grid-template-columns: 1fr;
    margin: 1rem 0;
  }
}
</style>

<div class="photo-sets">
{% assign photo_posts = site.posts | where: "category", "photos" %}
{% for post in photo_posts %}
  <a class="photo-set-card" href="{{ site.url }}{{ post.url }}">
    <img src="{{ post.cover }}" alt="{{ post.title }}" loading="lazy">
    <div class="photo-set-info">
      <div class="photo-set-title">{{ post.title }}</div>
      <div class="photo-set-date">{{ post.date | date: "%B %Y" }}</div>
    </div>
  </a>
{% endfor %}
</div>
