# Pebl Character — Final Concept

## THE CHARACTER

Pebl is a **smooth glowing orb** with **two small floating companion dots** that orbit it like hands. No face. No features. Personality comes from glow, movement, and the companion dots.

- **The Core:** Perfectly smooth sphere. Warm amber-to-peach gradient. Strong inner glow radiating outward. Slightly translucent at edges.
- **The Companions:** Two smaller dots (same color family, slightly brighter). They float near the ball like orbiting moons. They act as hands — they gesture, point, rise, droop, wave.

---

## FIREFLY PROMPTS

### 1. IDLE (default desktop state)

```
A smooth glowing 3D sphere floating above a subtle shadow. Warm amber to peach gradient surface with a strong soft inner glow radiating outward like a lantern. Slightly translucent at the edges where light bleeds through. Two tiny bright companion orbs floating beside it at mid-height, like small moons orbiting gently. Everything feels warm, alive, calm. Spline 3D minimal aesthetic. Clean white background. Soft warm light. 3D render, center frame.
```

### 2. WAVING / HELLO

```
A smooth glowing 3D sphere with warm amber-peach gradient and inner glow. Two tiny companion orbs floating beside it — one raised high above the sphere as if waving hello, the other resting at mid-height. The raised companion orb has a small motion trail suggesting movement. Warm, welcoming energy. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

### 3. BREATHING IN (meditation — expanding)

```
A smooth glowing 3D sphere, slightly larger than normal, as if inflated with a deep breath. Warm amber-peach gradient. Inner glow intensified and bright, radiating strongly outward. Two tiny companion orbs floating wide apart at the sides, spread out. The whole scene feels expanded, full, luminous. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

### 4. BREATHING OUT (meditation — contracting)

```
A smooth glowing 3D sphere, slightly smaller than normal, as if exhaling. Warm amber-peach gradient. Inner glow dimmed to a soft gentle warmth. Two tiny companion orbs floating close together near the sphere, tucked in. The whole scene feels relaxed, quiet, restful. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

### 5. STRETCH — ARMS UP

```
A smooth glowing 3D sphere with warm amber-peach gradient and inner glow. Two tiny companion orbs both positioned directly above the sphere, high up, as if reaching toward the sky. The sphere itself is slightly elongated upward, stretched taller. Uplifting energy. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

### 6. STRETCH — LEAN RIGHT

```
A smooth glowing 3D sphere with warm amber-peach gradient and inner glow. The sphere is tilted slightly to the right. Two tiny companion orbs — one extended far to the upper right, the other tucked near the lower left of the sphere. Side stretch energy, leaning into it. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

### 7. STRETCH — LEAN LEFT

```
A smooth glowing 3D sphere with warm amber-peach gradient and inner glow. The sphere is tilted slightly to the left. Two tiny companion orbs — one extended far to the upper left, the other tucked near the lower right. Mirror of the right lean. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

### 8. WATER REMINDER

```
A smooth glowing 3D sphere with warm amber-peach gradient. A subtle cool blue ripple of light pulses across the surface, blending with the warm glow. Two tiny companion orbs — one gently nudging forward toward the viewer. Calm, hydration energy. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

### 9. SNACK REMINDER

```
A smooth glowing 3D sphere with warm amber-peach gradient. A subtle soft green pulse ripples across the surface. Two tiny companion orbs floating gently beside it, one slightly bouncing. Nourishing, friendly energy. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

### 10. CELEBRATING / HAPPY

```
A smooth glowing 3D sphere with warm amber-peach gradient and intensified bright glow. The sphere is bouncing upward mid-jump. Two tiny companion orbs orbiting fast around the sphere in a circular path, with motion trails. Tiny warm-colored particle sparkles emitting outward. Pure joy energy, festive. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

### 11. BURNOUT WARNING

```
A smooth glowing 3D sphere. The color has shifted from warm amber-peach to a deeper warm red-orange, like overheating embers. Inner glow is dimmer, pulsing slowly. Two tiny companion orbs drooping low beneath the sphere, barely moving. Tired, concerned energy. A gentle warmth but clearly saying slow down. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

### 12. SLEEPING / GOODNIGHT

```
A smooth glowing 3D sphere resting on the ground surface instead of floating. Color is a dim soft amber, like dying campfire embers. Inner glow is very faint, barely visible, like a nightlight. Two tiny companion orbs resting on the ground beside it, completely still. A tiny subtle "zzz" text floating faintly above. Cozy, restful, goodnight energy. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

### 13. ENCOURAGING NUDGE

```
A smooth glowing 3D sphere with warm amber-peach gradient and soft inner glow. One tiny companion orb extended gently forward toward the viewer, like an outstretched hand offering support. The other companion orb at rest beside the sphere. Gentle, kind, supportive energy. Not pushy. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

### 14. POINTING (directing attention)

```
A smooth glowing 3D sphere with warm amber-peach gradient and inner glow. One tiny companion orb extended far to the right side of the frame, pointing. The sphere is slightly tilted toward the same direction, following the companion's lead. Alert but friendly, like saying hey look at this. Spline 3D minimal aesthetic. Clean white background. 3D render.
```

---

## HOW STATES WORK IN THE APP

| Moment | Ball behavior | Companion dots | Additional |
|--------|--------------|----------------|------------|
| Breathing | Inflates/deflates, glow pulses | Spread wide (in) / tucked close (out) | Timer text |
| Stretching | Tilts in direction of stretch | Point the direction to stretch | Text instruction |
| Water | Blue ripple across surface | One nudges toward user | "Time for water" text |
| Snack | Green pulse across surface | Gentle bounce | "Snack break?" text |
| Celebration | Bounces, bright glow | Orbit fast, particle trails | Confetti particles |
| Burnout | Color shifts red-orange, dims | Droop low, slow | "Take a break" text |
| Sleep | Settles on ground, ember glow | Rest on ground, still | Tiny "zzz" |
| Nudge | Soft pulse | One reaches toward user | Encouraging text |

---

## SPLINE 3D IMPLEMENTATION

Once you've picked the look from Firefly:
1. **Main sphere:** Spline primitive sphere, warm material with emissive glow
2. **Companion dots:** Two smaller spheres, same material but brighter emissive
3. **Animation states:** Use Spline's state machine to define positions for each state
4. **Transitions:** Smooth easing between states (spring physics for bounce, ease-in-out for calm)
5. **The glow:** Emissive material + point light inside the sphere = inner glow effect
6. **Export:** .splinecode → embed via @splinetool/react-spline in Electron app
