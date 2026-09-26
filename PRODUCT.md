# PRODUCT

## Platform

web

## Users

Tennis players who want a racket that looks like nobody else's. They open the builder on a laptop, sometimes a phone, with time to play: they try colors, spin the racket, undo, try again. They are not designers. They judge the result by how the racket looks, not by how the tool looks.

## Purpose

uniq lets a player paint their own tennis racket in 3D, zone by zone (frame, throat, handle), with real finishes (gloss, matte, metallic, pearl) and gradients, and see it under studio light before anything is made. Later: stickers, text, themes, mockup export.

## Positioning

A racket customizer that behaves like a pro design tool: precise controls, undo for everything, a live 3D preview that is the center of the screen. Brand customizers usually offer a few swatches on a flat picture; uniq gives full per-zone paint on a real 3D model.

## Surfaces and modes

| Surface | Route | Mode |
|---|---|---|
| Builder | `/` | Operate: the tool disappears, the racket leads |
| Design system | `/design-system` | Read: reference for tokens and components |

## Constraints

- Frontend only for now (React + three.js). No accounts, no saving to a server, no checkout.
- The 3D scene is the product. UI chrome must never compete with the racket colors.
- 60 fps on a mid-range laptop, 30+ fps on a mid-range phone.
- WCAG AA contrast in both dark and light mode. Every control works by keyboard and has a label.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.

## Brand commitments

- Name: uniq, written UNIQ in the logo.
- Tennis cues are allowed only as quiet references (court green), never as clip-art.

## Evidence on hand

- None yet. No users, no reviews, no partner brands, no real racket models (the racket is a procedural placeholder). Do not invent logos, testimonials or numbers.
