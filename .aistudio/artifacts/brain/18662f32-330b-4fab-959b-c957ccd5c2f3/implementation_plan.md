# Package Cards UI Restructuring & Crisp 2.5D Elevation Plan

Restructure the Package Cards across all tiers (STARTER, STANDARD, PREMIUM) to solve two core issues: eliminate font rasterization blur by transitioning from heavy 3D GPU tilt to crisp 2.5D elevation, and redesign the multi-platform deliverable row into a spacious 2-line structure that permanently prevents badge-and-icon overlap.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following user-confirmed decisions govern this implementation:

- **Confirmed Decision 1 (Crisp 2.5D Elevation Hover)**: Replace 3D perspective tilt (`rotateX`, `rotateY`, `perspective(1000px)`, and `preserve-3d`) with a smooth 2.5D elevation hover (`translateY(-6px)` with dynamic soft ambient drop shadows and subtle border lighting). This eliminates GPU texture rasterization and keeps all Thai typography, numbers, and icons 100% vector-crisp at all times.
- **Confirmed Decision 2 (2-Line Platform Deliverable Structure)**: Redesign the multi-platform deliverable container into 2 dedicated vertical lines:
  - **Line 1 (Platforms & Channels)**: Horizontal brand icons (TikTok, Instagram, Facebook, YouTube) paired with clear scope text (e.g. "ทุกช่องทางโซเชียล").
  - **Line 2 (Post Count & Distribution)**: A full-width or flex-justified strip featuring the clean post-count badge (e.g. "4 โพสต์" / "12 โพสต์") alongside coverage details ("กระจายครบ 4 แพลตฟอร์ม") with zero clipping or overlap.

---

### 1. Overview & Core Concept

- **What It Does**: Provides a polished, ultra-clean commercial presentation for creator rate packages where every text element, deliverable tag, and price tag is razor-sharp on hover, with a spacious, beautifully balanced deliverable layout.
- **Problem Solved**:
  1. *Font Blur on Hover*: In WebKit/Blink browsers, CSS 3D transforms (`rotateX/Y` with `preserve-3d` and nested `translateZ`) cause browsers to flatten elements into a fixed-resolution GPU bitmap, causing Thai font glyphs to appear fuzzy and washed out.
  2. *Badge Collision*: Squeezing 4 platform icons + text label + long post badge into a single narrow row caused the badge to overlap and obscure the text and icons.
- **Key Value**: Instant readability, zero visual clutter, and premium aesthetic polish that builds brand trust for prospective commercial clients.

---

### 2. User Experience & Visual Design

#### A. Crisp 2.5D Elevation Physics (Zero Font Blur)
- Remove `perspective`, `rotateX`, `rotateY`, and `transform-style: preserve-3d`.
- Apply smooth 2.5D vertical translation on hover:
  - Default: `translateY(0)` with clean resting border and subtle shadow.
  - Hover: `translateY(-6px)` with a rich, soft multi-layer ambient shadow (`shadow-[0_20px_35px_-8px_rgba(99,102,241,0.18)]`) and enhanced border accent.
  - Transition: Smooth cubic-bezier physics (`cubic-bezier(0.16, 1, 0.3, 1)`) for instant, lag-free responsiveness.
- All fonts render with native subpixel antialiasing (`-webkit-font-smoothing: antialiased`).

#### B. 2-Line Deliverable Container Layout
Redesign the platform row inside each package card into a structured 2-line layout:

```
┌────────────────────────────────────────────────────────┐
│  Line 1: Channels & Scope                              │
│  [TikTok] [IG] [FB] [YT]   ทุกแพลตฟอร์มหลัก            │
├────────────────────────────────────────────────────────┤
│  Line 2: Deliverable Output & Distribution             │
│  กระจายครบ 4 ช่องทาง          [ 4 โพสต์ ]             │
└────────────────────────────────────────────────────────┘
```

- **STARTER Card (1 Platform)**:
  - Line 1: TikTok brand icon + "ช่องทาง TikTok"
  - Line 2: "เผยแพร่หน้าโปรไฟล์" + badge "1 โพสต์"
- **STANDARD Card (4 Platforms)**:
  - Line 1: 4 brand icons horizontally + "ทุกแพลตฟอร์มหลัก (4 ช่องทาง)"
  - Line 2: "กระจายครบทุกแพลตฟอร์ม" + badge "4 โพสต์"
- **PREMIUM Card (4 Platforms)**:
  - Line 1: 4 brand icons horizontally + "ทุกแพลตฟอร์มหลัก (4 ช่องทาง)"
  - Line 2: "3 คลิป × 4 ช่องทาง" + badge "รวม 12 โพสต์"

#### C. Visual Hierarchy & "Most Popular" Accent
- **STANDARD Card**: Maintains its prominent "MOST POPULAR · แนะนำสูงสุด" crown badge, distinctive purple-fuchsia header banner, and refined indigo rim accent without any stiff background elements.
- **Card Selection**: Clicking toggles package selection with immediate feedback.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: 2.5D Elevation vs. 3D Tilt**
  - *Chosen Approach*: 2.5D elevation (`translateY(-6px)` + ambient shadow depth).
  - *Why*: Guarantees 100% crisp vector font rendering across all browser engines (Chrome, Edge, Safari, Firefox), completely eliminating GPU texture blur.
  - *Alternatives Considered*: Tweaking 3D tilt with `backface-visibility: hidden` and `scale(1.0001)`, which still causes font antialiasing degradation on high-DPI displays.

- **Decision 2: 2-Line Deliverable Structure vs. Compact 1-Line**
  - *Chosen Approach*: 2-line layout inside the deliverable card.
  - *Why*: Gives both the 4 brand icons and the post-count badges adequate horizontal breathing room across all screen widths (mobile, tablet, and desktop), completely eliminating overlapping.
  - *Alternatives Considered*: Shrinking badge padding and icon size in 1 line, which makes touch targets tiny and feels cramped.

---

### 4. Technical Architecture & File Updates

```
┌─────────────────────────────────────────────────────────────────┐
│                    Package3DCard.tsx                            │
│                                                                 │
│   • Replaced 3D tilt state with isHovered boolean               │
│   • Removed preserve-3d and perspective                         │
│   • Added 2.5D translateY(-6px) with dynamic elevation shadow   │
│   • Refactored platform container into 2 structured rows:       │
│       - Row 1: PlatformBadgeGroup + platform text               │
│       - Row 2: Coverage description + post count badge          │
└─────────────────────────────────────────────────────────────────┘
```

#### Files to be Modified:
1. `src/components/sections/ratecard/Package3DCard.tsx`:
   - Simplify mouse interaction to `isHovered` state (no complex mouse-tracking math).
   - Implement clean 2.5D elevation on hover.
   - Restructure the platform container into the approved 2-line layout.
