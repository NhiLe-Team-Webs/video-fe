Dưới đây là **bản phân rã hoàn chỉnh** từ tài liệu hiệu ứng bạn đã cung cấp (17 hiệu ứng) thành **GSAP Effect Packs** rõ ràng, có **mã STT tương ứng trong tài liệu PDF** để dùng cho **Module 3 – GSAP Frame Adapter & Transition Pack**.
(*Tài liệu được trích hoàn toàn từ PDF bạn upload — tôi sẽ dẫn số trang/hiệu ứng khi cần.* )

---

# ✅ **GSAP Effect Packs – Chuẩn hóa từ 17 hiệu ứng trong PDF**

Mỗi effect pack bao gồm:

* **Tên Pack**
* **Danh sách hiệu ứng trong pack**
* **Tên component GSAP sẽ tạo**
* **STT tương ứng trong PDF**
* **Loại hiệu ứng (motion / text / overlay / transition / background / data)**

---

# 🎨 **PACK 1 — TEXT MOTION PACK**

### *Dành cho text transform / emphasize / subtitle / list reveal*

---

## **1.1 – Pop-up / 3D Header Pack**

📄 **PDF Effect #1** 
**GSAP component**:

* `PopUp3DText.tsx` (GSAP + rotateX + perspective)

---

## **1.2 – Side Float Text Pack**

📄 **PDF Effect #2** 
**GSAP component**:

* `SideFloatText.tsx` (slide-in-left/right + fade)

---

## **1.3 – Sequential List Reveal Pack**

📄 **PDF Effect #3** 
**GSAP component**:

* `ListReveal.tsx` (stagger + fade + scale)

---

## **1.4 – Keyword Subtitle Highlight Pack**

📄 **PDF Effect #13** 
**GSAP component**:

* `SubtitleHighlight.tsx` (underline mask + glow)

---

## **1.5 – Keyword Color Flash Pack**

📄 **PDF Effect #14** 
**GSAP component**:

* `KeywordColorFlash.tsx` (color tween + glow)

---

# 🎬 **PACK 2 — CAMERA & SCENE TRANSITION PACK**

Dành cho các chuyển cảnh lớn giữa scene/video segment.

---

## **2.1 – Camera Zoom Focus Pack**

📄 **PDF Effect #4** 
**GSAP component**:

* `CameraPunch.tsx` (zoom in/out + ease)

---

## **2.2 – Section Title Divider Pack**

📄 **PDF Effect #5** 
**GSAP component**:

* `SectionDivider.tsx` (blur overlay + slide/fade title)

---

## **2.3 – Step Breakdown Transition Pack**

📄 **PDF Effect #8** 
**GSAP component**:

* `StepTransition.tsx` (list → step → list)

---

# 💠 **PACK 3 — ICON & OVERLAY EMPHASIS PACK**

Dành cho icon minh họa hoặc overlay ngắn xuất hiện theo lời nói.

---

## **3.1 – Icon Highlight Pack**

📄 **PDF Effect #6** 
**GSAP component**:

* `IconPop.tsx` (scale pop + fade + glow)

---

## **3.2 – Social Media Platform Pop-up Pack**

📄 **PDF Effect #11** 
**GSAP component**:

* `SocialIconPopup.tsx` (stagger + bounce + glow)

---

## **3.3 – App Intro Lower Third Pack**

📄 **PDF Effect #15** 
**GSAP component**:

* `AppLowerThird.tsx` (icon → name → tagline → link)

---

# 📊 **PACK 4 — DATA & DIAGRAM PACK**

Dành cho biểu đồ, mindmap, tree cấu trúc.

---

## **4.1 – Roadmap / Timeline Reveal Pack**

📄 **PDF Effect #7** 
**GSAP component**:

* `RoadmapReveal.tsx` (SVG path draw + node pop)

---

## **4.2 – Branch Tree Expansion Pack**

📄 **PDF Effect #12** 
**GSAP component**:

* `TreeExpand.tsx` (stroke draw → nodes)

---

## **4.3 – Circular Concept Map Pack**

📄 **PDF Effect #9** 
**GSAP component**:

* `ConceptCircle.tsx` (circle stroke → node fade-in)

---

## **4.4 – Data Visualization Pack**

📄 **PDF Effect #10** 
**GSAP component**:

* `LineChartReveal.tsx` (line draw + data pop)

---

# 🎧 **PACK 5 — AUDIO & BACKGROUND PACK**

---

## **5.1 – Audio Visualizer Pack**

📄 **PDF Effect #16** 
**GSAP component**:

* `AudioVisualizer.tsx` (bars or waveform with GSAP/Noise)

---

## **5.2 – Noise Dot Grid Background Pack**

📄 **PDF Effect #17** 
**GSAP component**:

* `NoiseDotGrid.tsx` (noise3D + slow drift background)

---

# 🎁 **OUTPUT CUỐI CỦA MODULE 3**

Bạn sẽ có:

### **1) Một thư mục GSAP hoàn chỉnh**

```
src/effects/engines/gsap/
  ├ PopUp3DText.tsx
  ├ SideFloatText.tsx
  ├ ListReveal.tsx
  ├ SubtitleHighlight.tsx
  ├ KeywordColorFlash.tsx
  ├ CameraPunch.tsx
  ├ SectionDivider.tsx
  ├ StepTransition.tsx
  ├ IconPop.tsx
  ├ SocialIconPopup.tsx
  ├ AppLowerThird.tsx
  ├ RoadmapReveal.tsx
  ├ TreeExpand.tsx
  ├ ConceptCircle.tsx
  ├ LineChartReveal.tsx
  ├ AudioVisualizer.tsx
  ├ NoiseDotGrid.tsx
```

### **2) Một GSAP Transition Pack**

* `gsapConfig.ts`
* `GsapEffect.tsx`
* `useAnimationById.ts`

### **3) Preview chung toàn bộ hiệu ứng**

Trong **EffectGallery.tsx**, hiển thị toàn bộ GSAP + Lottie + Native.

---

# 🧪 **Bạn có muốn tôi tạo file `.md` chuẩn hóa pack này (để dán vào repo)?**

## Bạn muốn bước kế tiếp là:

### **A — Tôi tạo file skeleton code cho từng hiệu ứng? (17 file GSAP)**

### **B — Tôi build framework preview trước?**

### **C — Tôi merge tất cả vào taxonomy + registry?**

Chỉ cần chọn **A / B / C** hoặc **ALL**.
