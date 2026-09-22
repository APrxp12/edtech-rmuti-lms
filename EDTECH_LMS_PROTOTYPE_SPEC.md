# EDTech LMS — Complete System Prototype & Architecture Specification
> **เอกสารพิมพ์เขียวและสเปกระบบฉบับสมบูรณ์ (All-in-One Prototype Specification)**  
> รวบรวมสถาปัตยกรรม, โครงสร้างไฟล์, รายละเอียดระบบทั้ง 5 ส่วน, Data Models, ตัวอย่างโค้ดสำคัญ, และ Master AI Prompt พร้อมใช้งาน 100%

---

## สารบัญ (Table of Contents)
1. [ภาพรวมโครงการและเทคโนโลยี (Tech Stack & Architecture)](#1-ภาพรวมโครงการและเทคโนโลยี-tech-stack--architecture)
2. [โครงสร้างไฟล์และโฟลเดอร์แบบสมบูรณ์ (Complete Project Directory Map)](#2-โครงสร้างไฟล์และโฟลเดอร์แบบสมบูรณ์-complete-project-directory-map)
3. [รายละเอียด 5 ระบบการทำงานหลัก (Core System Modules)](#3-รายละเอียด-5-ระบบการทำงานหลัก-core-system-modules)
   - 3.1 [ระบบยืนยันตัวตนและดักกรองข้อมูล (Auth & Profile Gatekeeper)](#31-ระบบยืนยันตัวตนและดักกรองข้อมูล-auth--profile-gatekeeper)
   - 3.2 [วงจรการเรียนรู้ 5 ขั้นตอน (5-Step Pedagogical Learning Journey)](#32-วงจรการเรียนรู้-5-ขั้นตอน-5-step-pedagogical-learning-journey)
   - 3.3 [ระบบมุมมองผู้เรียน (Student Portal Experience)](#33-ระบบมุมมองผู้เรียน-student-portal-experience)
   - 3.4 [ระบบจัดการสำหรับผู้สอนและผู้ดูแล (Admin CMS Console)](#34-ระบบจัดการสำหรับผู้สอนและผู้ดูแล-admin-cms-console)
   - 3.5 [ระบบดีไซน์และธีม (Modern UI, Dark Mode & Abstract Posters)](#35-ระบบดีไซน์และธีม-modern-ui-dark-mode--abstract-posters)
4. [โครงสร้างฐานข้อมูลและ Data Models (Database Schema & Types)](#4-โครงสร้างฐานข้อมูลและ-data-models-database-schema--types)
5. [ตัวอย่างโค้ดแกนหลักของระบบ (Key Core Implementations)](#5-ตัวอย่างโค้ดแกนหลักของระบบ-key-core-implementations)
6. [Master AI Prompt สำหรับสั่ง AI สร้างโปรเจกต์นี้แบบ 100%](#6-master-ai-prompt-สำหรับสั่ง-ai-สร้างโปรเจกต์นี้แบบ-100)

---

## 1. ภาพรวมโครงการและเทคโนโลยี (Tech Stack & Architecture)

| ส่วนประกอบ | เทคโนโลยี / เครื่องมือ | วัตถุประสงค์และเหตุผลที่เลือกใช้ |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16 (App Router + Turbopack)** | สถาปัตยกรรม Server Components + Client Components, ทำ Route Groups ชัดเจน, คอมไพล์เร็ว |
| **Language** | **TypeScript 5** | Strict Type Checking ป้องกัน Bug ในขั้นตอนพัฒนา |
| **CSS & Design** | **Tailwind CSS v4** | CSS-first configuration, กำหนด `@custom-variant dark (&:where(.dark, .dark *));` สำหรับ Class-based Dark Mode |
| **Icon Set** | **Lucide React** | ไอคอน Vector คุณภาพสูง ครอบคลุม UI/LMS ทุกรูปแบบ |
| **Database** | **Supabase (PostgreSQL)** | คลาวด์ดาต้าเบสสำหรับเก็บบทเรียน, คลังข้อสอบ, ผลคะแนน, ประกาศ, และผู้ใช้ |
| **Local State & Fallback** | **Zustand / Reactive Store + LocalStorage** | สถาปัตยกรรม **Offline-First Fallback** หาก Supabase หลุดหรือไม่ได้ต่อเน็ต ระบบจะใช้ Mock Data และ LocalStorage ให้เรียนต่อได้ทันที |
| **Authentication** | **Google Identity Services (GSI) OAuth 2.0** | ปุ่มล็อกอิน Google อย่างเป็นทางการ ถอดรหัส JWT Token ปลอดภัย ไม่ต้องเก็บ Password |
| **Theme Engine** | **Dual Theme Engine (Light / Dark)** | บันทึกค่าใน LocalStorage (`edtech-theme`), ตรวจจับ OS (`prefers-color-scheme`), ป้องกันจอกะพริบด้วย Anti-FOUC script |

---

## 2. โครงสร้างไฟล์และโฟลเดอร์แบบสมบูรณ์ (Complete Project Directory Map)

```text
edtech-lms/
├── public/                                   # Static Assets (โลโก้, favicon, SVG)
│   ├── favicon.ico
│   └── ...
├── src/
│   ├── app/
│   │   ├── globals.css                       # สไตล์หลัก Tailwind v4, @custom-variant dark, CSS Variables
│   │   ├── layout.tsx                        # Root Layout + Inline Anti-FOUC Script + ThemeProvider
│   │   ├── page.tsx                          # Root Redirect (นำทางไป /login หรือ /dashboard)
│   │   │
│   │   ├── (auth)/                           # กลุ่ม Route ระบบยืนยันตัวตน
│   │   │   ├── login/page.tsx                # หน้าเข้าสู่ระบบ (Google Sign-In + Theme Toggle)
│   │   │   └── required-profile/page.tsx     # หน้ายืนยันข้อมูลโปรไฟล์แบบเดี่ยว
│   │   │
│   │   ├── (student)/                        # กลุ่ม Route สำหรับนักศึกษา (Student Portal)
│   │   │   ├── layout.tsx                    # Student Layout (Navbar + StudentSidebar + MobileBottomNav)
│   │   │   ├── dashboard/page.tsx            # แดชบอร์ดผู้เรียน, ข่าวสาร, สถิติเปอร์เซ็นต์, การ์ดบทเรียน
│   │   │   ├── my-lessons/page.tsx           # หน้ารวมบทเรียน (Syllabus) รองรับ Grid View และ List View
│   │   │   ├── my-progress/page.tsx          # หน้าสรุปผลการเรียนและคะแนนสอบทุกบทเรียน
│   │   │   ├── announcements/page.tsx        # ข่าวประชาสัมพันธ์และกิจกรรมรายวิชา
│   │   │   ├── profile/page.tsx              # หน้าดู/แก้ไขข้อมูลส่วนตัวนักศึกษา
│   │   │   ├── faq/page.tsx                  # คู่มือการใช้งานและคำถามที่พบบ่อย
│   │   │   └── lessons/[lessonCode]/         # เส้นทางวงจรการเรียนรู้ของแต่ละบทเรียน
│   │   │       ├── intro/page.tsx            # บทนำ สาระสำคัญ วัตถุประสงค์เชิงพฤติกรรม
│   │   │       ├── pre-test/page.tsx         # แบบทดสอบวัดความรู้ก่อนเรียน พร้อมตัวจับเวลา
│   │   │       ├── learn/page.tsx            # วิดีโอบรรยาย (YouTube) + สไลด์เอกสารดาวน์โหลด
│   │   │       ├── post-test/page.tsx        # แบบทดสอบวัดผลสัมฤทธิ์หลังเรียน (เกณฑ์ผ่าน 80%)
│   │   │       └── result/page.tsx           # สรุปคะแนน Pre vs Post, พัฒนาการ, และพิมพ์ใบประกาศฯ
│   │   │
│   │   └── (admin)/admin/                    # กลุ่ม Route ผู้ดูแลระบบ/อาจารย์ (Admin CMS)
│   │       ├── layout.tsx                    # Admin Layout มี Route Guard สิทธิ์ admin เท่านั้น
│   │       ├── lessons/                      # ระบบจัดการบทเรียน
│   │       │   ├── page.tsx                  # ตารางบทเรียน, KPI Counters, ปุ่มซิงค์ Cloud, ปุ่มลบ
│   │       │   ├── new/page.tsx              # สร้างบทเรียนใหม่ (ออกรหัส IDTLM-xxx อัตโนมัติ)
│   │       │   └── [id]/
│   │       │       ├── metadata/page.tsx     # แก้ไขชื่อ คำอธิบาย วัตถุประสงค์ สถานะ
│   │       │       └── content/page.tsx      # จัดการคลิปวิดีโอ (YouTube) และเอกสารดาวน์โหลด
│   │       ├── quizzes/[id]/page.tsx         # Quiz Builder สร้าง/แก้ไขข้อสอบ 4 ตัวเลือกพร้อมเฉลย
│   │       ├── announcements/page.tsx        # จัดการประกาศ ข่าวสาร และรูปภาพ
│   │       ├── users/page.tsx                # จัดการรายชื่อผู้เรียน ตรวจสอบคะแนน สลับ Role
│   │       ├── access-rules/page.tsx         # กำหนดเงื่อนไขการเข้าถึงและโดเมนอีเมล
│   │       └── settings/page.tsx             # ตั้งค่าข้อมูลรายวิชาและผู้สอน
│   │
│   ├── components/
│   │   ├── navigation/                       # แถบนำทาง
│   │   │   ├── Navbar.tsx                    # แถบหัวเว็บ โลโก้, ThemeToggle, ข้อมูลโปรไฟล์
│   │   │   ├── StudentSidebar.tsx            # เมนูด้านข้างสำหรับนักศึกษา
│   │   │   ├── AdminSidebar.tsx              # เมนูด้านข้างสำหรับอาจารย์/ผู้ดูแล
│   │   │   └── MobileBottomNav.tsx           # เมนูด้านล่างสำหรับหน้าจอมือถือ
│   │   ├── modals/                           # หน้าต่างป็อบอัพ
│   │   │   └── RequiredProfileModal.tsx      # ป็อบอัพบังคับกรอก คำนำหน้า ชื่อ นามสกุล รหัสนักศึกษา
│   │   ├── providers/                        # Providers
│   │   │   └── ThemeProvider.tsx             # Context ควบคุม Light/Dark Mode + LocalStorage
│   │   ├── shared/                           # คอมโพเนนต์อเนกประสงค์
│   │   │   ├── LessonCoverPoster.tsx         # โปสเตอร์บทเรียนแบบ Abstract Generative สวยงาม
│   │   │   ├── SharedDialogs.tsx             # กล่อง Skeleton และ EmptyStateCard
│   │   │   └── FileUploadBox.tsx             # กล่องเลือก/อัปโหลดรูปภาพ
│   │   └── ui/                               # Atomic UI
│   │       ├── ThemeToggle.tsx               # ปุ่มไอคอนพระอาทิตย์/พระจันทร์สลับธีม
│   │       └── UserAvatar.tsx                # แสดงรูปอวาตาร์ Google หรืออักษรย่อ
│   │
│   ├── config/
│   │   └── site-branding.ts                  # ข้อมูลหลัก: ชื่อวิชา, รหัสวิชา, มหาวิทยาลัย, อาจารย์
│   ├── data/
│   │   ├── store.ts                          # App Store รวม State และฟังก์ชันทั้งหมดของระบบ
│   │   └── mockData.ts                       # ข้อมูลจำลองตั้งต้น (Seed Data)
│   ├── lib/
│   │   ├── supabase.ts                       # การตั้งค่า Supabase Client
│   │   ├── dbService.ts                      # ฟังก์ชันเชื่อมต่อฐานข้อมูล CRUD
│   │   └── profileValidation.ts              # ฟังก์ชันตรวจสอบความถูกต้องของชื่อ นามสกุล และรหัส นศ.
│   └── types/
│       └── index.ts                          # Type Definitions ทั้งหมดของระบบ
│
├── .env.local                                # เก็บ Environment Variables
├── package.json                              # Scripts และ Dependencies
├── tsconfig.json                             # การตั้งค่า TypeScript Compiler
└── next.config.ts                            # การตั้งค่า Next.js
```

---

## 3. รายละเอียด 5 ระบบการทำงานหลัก (Core System Modules)

### 3.1 ระบบยืนยันตัวตนและดักกรองข้อมูล (Auth & Profile Gatekeeper)
1. **Google Identity Services (GSI):** 
   - ใช้งานผ่าน Official Google Script (`accounts.google.com/gsi/client`)
   - ถอดรหัส JWT Payload ในฝั่ง Client: ได้ข้อมูล Email, Full Name, Avatar Image
   - ดักกรองโดเมนเฉพาะ (เช่น `@rmuti.ac.th`) หรืออนุญาตเฉพาะบัญชีในตาราง `access_rules`
2. **Role-Based Access Control (RBAC):**
   - ผู้ใช้มี 2 บทบาท: `student` (นักศึกษา) และ `admin` (อาจารย์/ผู้ดูแลระบบ)
   - Route `/(admin)/admin/...` ถูกคุ้มครองด้วย Layout Guard หากผู้ใช้ไม่ใช่ `admin` จะถูก Redirect ไปที่แดชบอร์ดทันที
3. **Mandatory Profile Gatekeeper (ระบบบังคับกรอกข้อมูลนักศึกษา):**
   - บังคับตรวจเช็ค 4 ฟิลด์หลัก:
     1. **คำนำหน้าชื่อ:** นาย, นางสาว, หรือ นาง
     2. **ชื่อจริง (ภาษาไทย):** ต้องไม่ว่างเปล่า
     3. **นามสกุล (ภาษาไทย):** ต้องไม่ว่างเปล่า
     4. **รหัสนักศึกษา:** ตรวจสอบรูปแบบตัวเลข 10-15 หลัก
   - **การบล็อกระดับแอปพลิเคชัน:** หากนักศึกษายังกรอกข้อมูลไม่ครบ เมื่อคลิกปุ่ม "เริ่มเรียน", "เรียนต่อ" หรือเข้าหน้ารายการบทเรียน ป็อบอัพ `RequiredProfileModal` จะเด้งขึ้นมาบล็อกทันที และไม่อนุญาตให้เริ่มเรียนจนกว่าจะบันทึกครบถ้วน

---

### 3.2 วงจรการเรียนรู้ 5 ขั้นตอน (5-Step Pedagogical Learning Journey)
ระบบจัดการการเรียนรู้ถูกจัดลำดับตามหลักจิตวิทยาการศึกษา (Pedagogy) 5 สเต็ป:

```
[หน้ารวมบทเรียน /my-lessons]
           │
           ▼
┌──────────────────────────────────────────────┐
│ 1. บทนำ (Intro): /lessons/[code]/intro       │
│ - สาระสำคัญและแนวคิดหลัก                      │
│ - วัตถุประสงค์เชิงพฤติกรรม                    │
│ - ปุ่มนำทางไปยังแบบทดสอบก่อนเรียน            │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 2. แบบทดสอบก่อนเรียน (Pre-test)              │
│ - สุ่มสลับคำถามและตัวเลือก 4 ตัวเลือก        │
│ - มีตัวจับเวลานับถอยหลัง                     │
│ - บันทึกคะแนนฐาน (Baseline Score)            │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 3. เนื้อหาการเรียนรู้ดิจิทัล (Learn)          │
│ - เครื่องเล่นวิดีโอ YouTube บรรยาย           │
│ - บันทึกเปอร์เซ็นต์เวลาที่ดูวิดีโอ            │
│ - ดาวน์โหลดเอกสารประกอบ สไลด์ และใบงาน       │
│ - ปุ่มกด "เรียนจบเนื้อหาเพื่อไปทำข้อสอบ"     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 4. แบบทดสอบหลังเรียน (Post-test)             │
│ - วัดผลสัมฤทธิ์ทางการเรียน                   │
│ - กำหนดเกณฑ์ผ่าน (เช่น 80%)                   │
│ - กำหนดจำนวนรอบที่ทำได้ (Max Attempts)       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ 5. สรุปผลและใบประกาศนียบัตร (Result)         │
│ - กราฟเปรียบเทียบ Pre vs Post (+Gain Score)   │
│ - ตรวจคำตอบพร้อมคำอธิบายเฉลย                 │
│ - หากผ่านเกณฑ์: มีปุ่ม "พิมพ์ใบประกาศนียบัตร"│
└──────────────────────────────────────────────┘
```

---

### 3.3 ระบบมุมมองผู้เรียน (Student Portal Experience)
- **Dashboard (`/dashboard`):** 
  - ส่วนหัว Course Syllabus Hero แสดงข้อมูลวิชา, ผู้สอน, ภาคเรียน
  - การ์ดสถิติวงกลม (Circular Progress Wheel) แสดงเปอร์เซ็นต์ความก้าวหน้าทั้งวิชา
  - สรุปสถานะบทเรียนที่กำลังเรียนค้างอยู่ พร้อมปุ่มคลิก "เรียนต่อ" ทันที
  - แถบข่าวสารและประกาศสำคัญล่าสุด
- **My Lessons (`/my-lessons`):**
  - สวิตช์สลับมุมมองระหว่าง **Grid View (แบบการ์ด)** และ **List View (แบบรายการ)**
  - ตัวกรองสถานะ: ทั้งหมด, กำลังเรียน, ผ่านแล้ว, รอสอบ Post-test, ยังไม่เปิดเรียน
  - แสดงชิปจำนวนคลิปวิดีโอ, จำนวนสื่อ, และเวลาเรียนโดยประมาณ
- **My Progress (`/my-progress`):**
  - ตารางผลคะแนน Pre-test และ Post-test ของทุกบทเรียน
  - การคำนวณคะแนนพัฒนาการ (+%) และสถานะการผ่านเกณฑ์

---

### 3.4 ระบบจัดการสำหรับผู้สอนและผู้ดูแล (Admin CMS Console)
- **Lessons Management (`/admin/lessons`):**
  - การ์ดสรุป KPI สถิติแบบ Live: จำนวนบทเรียนทั้งหมด, บทที่เผยแพร่แล้ว, ฉบับร่าง, จำนวนสื่อและคลิปรวม
  - **ระบบสร้างบทเรียนใหม่แบบรันรหัสอัตโนมัติ:** เมื่อสร้างบทใหม่ ระบบจะตั้งรหัสตามลำดับ เช่น `IDTLM-001`, `IDTLM-002`... ป้องกันการตั้งรหัสซ้ำ และให้ระบุเฉพาะหมายเลขบท
  - การจัดการบทเรียน: แก้ไขข้อมูลบทเรียน (Metadata), จัดการคลิป YouTube และไฟล์เอกสาร (Content), และปุ่มลบบทเรียนพร้อมยืนยันความปลอดภัย
  - **ปุ่มซิงค์ข้อมูล (Cloud Sync Button):** ซิงค์ข้อมูลบทเรียนและข้อสอบทั้งหมดขึ้น Supabase Cloud ในคลิกเดียว
- **Quiz Builder (`/admin/quizzes/[id]`):**
  - จัดการข้อสอบ Pre-test และ Post-test
  - เพิ่ม/แก้ไข/ลบข้อสอบ 4 ตัวเลือก พร้อมกำหนดตัวเลือกที่ถูกต้องและคำอธิบายเฉลย
- **Announcements CMS (`/admin/announcements`):**
  - สร้างข่าวประกาศ อัปโหลดรูปภาพหน้าปก กำหนดหมวดหมู่ (ประกาศ, อัปเดต, กิจกรรม) และกำหนดวันหมดอายุ
- **Users Management (`/admin/users`):**
  - ดูรายชื่อนักศึกษาทั้งหมด, ตรวจสอบคะแนนสอบ, และสลับสิทธิ์ระหว่าง `student` และ `admin`

---

### 3.5 ระบบดีไซน์และธีม (Modern UI, Dark Mode & Abstract Posters)

#### A. ระบบ Dark Mode (โหมดมืด)
- **Tailwind CSS v4 Configuration:**
  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  ```
- **โทนสีที่ใช้ (Color Palette):**
  - พื้นหลังหลัก (Main Background): `#0B0F19` (Deep Space Dark) สบายตา ลดแสงสะท้อน
  - พื้นผิวการ์ดและคอนเทนเนอร์ (Surface Cards): `#111827` (Tailwind Slate-900)
  - เส้นขอบ (Borders): `border-slate-800` หรือ `border-slate-700/60`
  - ข้อความ: ข้อความหลัก `text-white`, ข้อความรอง `text-slate-400`
  - สีเน้น (Accents): น้ำเงิน `text-blue-400`, เขียว `text-emerald-400`, ส้มอำพัน `text-amber-400`
- **Anti-FOUC (Flash of Unstyled Content):** มี Script แทรกใน `<head>` เพื่อตรวจจับ LocalStorage ทันทีที่หน้าเริ่มโหลด ทำให้หน้าเว็บไม่กะพริบขาวเมื่อกดรีเฟรช

#### B. ระบบโปสเตอร์บทเรียนอัตโนมัติ (Dynamic Generative Lesson Posters)
- คอมโพเนนต์ `LessonCoverPoster.tsx` ออกแบบมาเพื่อแก้ปัญหาภาพแตกหรือภาพไม่โหลด โดยจะสร้างภาพกราฟิกแบบ Abstract ไล่เฉดสีตามลำดับบทเรียน (`sortOrder`):
  - **บทที่ 1:** Royal Blue & Tech Indigo Gradient
  - **บทที่ 2:** Deep Violet & Nebula Purple Gradient
  - **บทที่ 3:** Cyan Ocean & Electric Teal Gradient
  - **บทที่ 4:** Emerald Forest & Mint Gradient
  - **บทที่ 5:** Sunset Amber & Coral Rose Gradient
  - **บทที่ 6+:** Cosmic Dark Indigo & Tech Slate
- มีลวดลายเรขาคณิตจาง ๆ (Subtle Geometric Mesh Circles) พร้อม Watermark ตัวเลขประจำบทขนาดใหญ่ด้านหลัง (`01`, `02`...)
- หากมีรูปภาพจริงจะแสดงรูปจริง หากโหลดรูปไม่ติดระบบจะสลับมาใช้ Poster อัตโนมัติ (Zero-broken image)

---

## 4. โครงสร้างฐานข้อมูลและ Data Models (Database Schema & Types)

### 4.1 SQL Schema สำหรับ Supabase
```sql
-- 1. ตารางข้อมูลผู้ใช้ (users)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  display_name text,
  full_name text,
  student_id text,
  role text default 'student', -- 'student' | 'admin'
  status text default 'active', -- 'active' | 'inactive' | 'blocked'
  is_profile_completed boolean default false,
  avatar_url text,
  first_login_at timestamp with time zone default now(),
  last_login_at timestamp with time zone default now()
);

-- 2. ตารางบทเรียน (lessons)
create table if not exists lessons (
  id text primary key,
  code text unique not null,    -- เช่น 'IDTLM-001'
  title text not null,
  description text,
  sort_order int not null,
  status text default 'draft', -- 'draft' | 'published' | 'archived'
  counts_in_course_progress boolean default true,
  cover_image_url text,
  intro_infographic_url text,
  current_published_version_id text,
  current_draft_version_id text,
  versions jsonb not null default '[]'::jsonb, -- เก็บ versionTag, videos, resources, objectives
  updated_at timestamp with time zone default now()
);

-- 3. ตารางแบบทดสอบ (quizzes)
create table if not exists quizzes (
  id text primary key,
  lesson_id text not null,
  type text not null,          -- 'pre_test' | 'post_test'
  title text not null,
  current_published_version_id text,
  current_draft_version_id text,
  versions jsonb not null default '[]'::jsonb, -- เก็บ questions, options, passScorePercent, maxAttempts
  updated_at timestamp with time zone default now()
);

-- 4. ตารางความก้าวหน้าและการสอบของผู้เรียน (user_progress)
create table if not exists user_progress (
  id text primary key,
  user_id text not null,
  lesson_id text not null,
  assigned_version_id text,
  status text default 'not_started', -- 'not_started' | 'in_progress' | 'content_completed' | 'passed'
  progress_percent int default 0,
  is_pre_test_completed boolean default false,
  pre_test_score jsonb,
  is_post_test_unlocked boolean default false,
  post_test_attempts jsonb default '[]'::jsonb,
  pre_test_attempts jsonb default '[]'::jsonb,
  best_post_test_score_percent numeric,
  watched_videos jsonb default '{}'::jsonb,
  first_started_at timestamp with time zone,
  completed_at timestamp with time zone,
  last_accessed_at timestamp with time zone default now()
);

-- 5. ตารางประกาศรายวิชา (announcements)
create table if not exists announcements (
  id text primary key,
  title text not null,
  body text not null,
  category text default 'announcement', -- 'announcement' | 'update' | 'activity'
  image_url text,
  status text default 'published',     -- 'published' | 'draft' | 'archived'
  published_at text,
  expires_at text,
  updated_at timestamp with time zone default now()
);
```

### 4.2 TypeScript Definitions (`src/types/index.ts`)
```typescript
export type UserRole = 'student' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  fullName: string;
  studentId: string;
  role: UserRole;
  status: UserStatus;
  isProfileCompleted: boolean;
  firstLoginAt: string;
  lastLoginAt: string;
  avatarUrl?: string;
}

export type LessonStatus = 'draft' | 'published' | 'archived';
export type LearnerLessonStatus = 'not_started' | 'in_progress' | 'content_completed' | 'completed_not_passed' | 'passed';

export interface LessonVideo {
  id: string;
  title: string;
  provider: 'youtube' | 'gdrive' | 'direct';
  videoUrlOrId: string;
  durationMinutes: string;
  durationSeconds: number;
  isRequired: boolean;
  sortOrder: number;
  status: 'published' | 'draft' | 'archived';
}

export interface LessonResource {
  id: string;
  title: string;
  type: 'pdf' | 'canva' | 'infographic' | 'pptx' | 'image' | 'document' | 'link';
  fileUrl: string;
  fileSize?: string;
  displayLocation: 'intro' | 'content' | 'both';
  sortOrder: number;
  status: 'published' | 'draft' | 'archived';
}

export interface LessonVersion {
  id: string;
  lessonId: string;
  versionTag: string;
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedDurationMinutes: number;
  videos: LessonVideo[];
  resources: LessonResource[];
  preTestQuizId?: string;
  postTestQuizId?: string;
  status: 'draft' | 'published' | 'archived';
  learnerCount: number;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  code: string;
  title: string;
  description: string;
  sortOrder: number;
  countsInCourseProgress: boolean;
  coverImageUrl?: string;
  introInfographicUrl?: string;
  status: LessonStatus;
  versions: LessonVersion[];
  updatedAt: string;
}

export interface QuizOption {
  id: string;
  optionText: string;
  isCorrect?: boolean;
  sortOrder: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: 'single_choice' | 'true_false';
  points: number;
  explanation?: string;
  sortOrder: number;
  options: QuizOption[];
  status: 'active' | 'archived';
}

export interface QuizVersion {
  id: string;
  quizId: string;
  versionTag: string;
  passScorePercent: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showExplanation: boolean;
  questions: QuizQuestion[];
  status: 'draft' | 'published' | 'archived';
  updatedAt: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  type: 'pre_test' | 'post_test';
  title: string;
  versions: QuizVersion[];
}
```

---

## 5. ตัวอย่างโค้ดแกนหลักของระบบ (Key Core Implementations)

### 5.1 โปสเตอร์บทเรียนแบบ Abstract (`LessonCoverPoster.tsx`)
```tsx
'use client';

import React, { useState } from 'react';
import { Lesson } from '@/types';
import { Sparkles, Layers } from 'lucide-react';

const PALETTES = [
  { from: 'from-blue-600 via-indigo-600 to-slate-900', accent: 'text-blue-300', tag: 'bg-blue-500/30 text-blue-200 border-blue-400/30' },
  { from: 'from-violet-600 via-purple-700 to-slate-900', accent: 'text-purple-300', tag: 'bg-purple-500/30 text-purple-200 border-purple-400/30' },
  { from: 'from-cyan-600 via-teal-700 to-slate-900', accent: 'text-cyan-300', tag: 'bg-cyan-500/30 text-cyan-200 border-cyan-400/30' },
  { from: 'from-emerald-600 via-teal-800 to-slate-900', accent: 'text-emerald-300', tag: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/30' },
  { from: 'from-amber-600 via-rose-700 to-slate-900', accent: 'text-amber-300', tag: 'bg-amber-500/30 text-amber-200 border-amber-400/30' },
  { from: 'from-slate-700 via-slate-800 to-slate-950', accent: 'text-slate-300', tag: 'bg-slate-500/30 text-slate-200 border-slate-400/30' },
];

export function LessonCoverPoster({ lesson, compact = false }: { lesson: Lesson; compact?: boolean }) {
  const [imageError, setImageError] = useState(false);
  const paletteIndex = Math.max(0, (lesson.sortOrder - 1) % PALETTES.length);
  const palette = PALETTES[paletteIndex];

  if (lesson.coverImageUrl && !imageError) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-slate-900">
        <img
          src={lesson.coverImageUrl}
          alt={lesson.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gradient-to-br ${palette.from} flex flex-col justify-between p-4 select-none`}>
      <div className="absolute -right-4 -bottom-6 text-white/[0.08] font-black text-7xl sm:text-8xl font-mono leading-none pointer-events-none">
        {String(lesson.sortOrder).padStart(2, '0')}
      </div>
      <div className="relative z-10 flex items-center justify-between">
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${palette.tag}`}>
          {lesson.code}
        </span>
        <Sparkles className={`w-3.5 h-3.5 ${palette.accent} opacity-80`} />
      </div>
      <div className="relative z-10">
        <h4 className="text-white text-xs sm:text-sm font-bold line-clamp-2 drop-shadow-sm">
          {lesson.title}
        </h4>
      </div>
    </div>
  );
}
```

### 5.2 สวิตช์สลับธีม (`ThemeToggle.tsx`)
```tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse ${className}`} />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-center cursor-pointer ${className}`}
      title={isDark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 transition-all duration-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600 transition-all duration-300 hover:text-indigo-600" />
      )}
    </button>
  );
}

export default ThemeToggle;
```

---

## 6. Master AI Prompt สำหรับสั่ง AI สร้างโปรเจกต์นี้แบบ 100%

> **วิธีใช้งาน:** คัดลอกข้อความด้านล่างนี้ทั้งหมด นำไปสั่ง AI Agent ใน Workspace ใหม่ เพื่อให้ AI เริ่มต้นโครงงานและพัฒนาเว็บไซต์ตามสเปกนี้ได้ทันที 100%:

```markdown
คุณคือ Senior Full-Stack Architect และ UI/UX Engineer ผู้เชี่ยวชาญระดับแนวหน้า หน้าที่ของคุณคือสร้างระบบจัดการการเรียนรู้ดิจิทัล (EDTech LMS) แบบ Production-Ready สมบูรณ์ 100% ตามข้อกำหนดและสถาปัตยกรรมต่อไปนี้:

### 1. Technology & Foundations
- Framework: Next.js 16 (App Router + Turbopack) + React 19 + TypeScript
- Styling: Tailwind CSS v4 กำหนด @custom-variant dark (&:where(.dark, .dark *)); สำหรับ Class-based dark mode
- Icons: Lucide React
- Database: Supabase (PostgreSQL) + LocalStorage Fallback (Offline-First Architecture)
- Authentication: Google Identity Services (GSI) OAuth 2.0 (คัดกรองอีเมลและบทบาทผู้ใช้)

### 2. Branding & Theme Engine
- Dual Theme (สลับได้ทันทีบน Navbar):
  * Light Mode: พื้นหลัง slate-50, พื้นผิวการ์ดสีขาว, เส้นขอบ slate-200, ตัวอักษร slate-800
  * Dark Mode: พื้นหลัง #0B0F19 (Deep Space), การ์ด #111827 (Slate-900), เส้นขอบ border-slate-800, ตัวอักษร text-white / text-slate-100
  * ติดตั้ง Inline Script ดักใน <head> ของ layout.tsx เพื่อป้องกันหน้าจอกะพริบขาว (Anti-FOUC)
- ระบบ Dynamic Abstract Lesson Poster (LessonCoverPoster.tsx):
  * สร้างโปสเตอร์ไล่เฉดสีตาม sortOrder (น้ำเงิน, ม่วง, ฟ้าคราม, เขียว, ส้ม, เทา) พร้อม Watermark ตัวเลขขนาดใหญ่ สลับแทนรูปจริงอัตโนมัติเมื่อรูปโหลดไม่ติด

### 3. Role-Based Access Control & Mandatory Gatekeeper
- 2 สิทธิ์: 'student' (ผู้เรียน) และ 'admin' (อาจารย์/ผู้ดูแล)
- Profile Gatekeeper (RequiredProfileModal.tsx):
  * ตรวจสอบ 4 ฟิลด์บังคับ: คำนำหน้าชื่อ (นาย/นางสาว/นาง), ชื่อจริง, นามสกุล, และ รหัสนักศึกษา (10-15 หลัก)
  * หากยังไม่ครบ ระบบจะบล็อกไม่ให้กดเข้าเรียนบทเรียนใด ๆ ทั้งสิ้นจนกว่าจะกรอกเสร็จ

### 4. 5-Step Pedagogical Learning Journey (สำหรับแต่ละบทเรียน)
1. /lessons/[lessonCode]/intro: วัตถุประสงค์เชิงพฤติกรรม สาระสำคัญ และปุ่มเริ่มสอบ Pre-test
2. /lessons/[lessonCode]/pre-test: ข้อสอบก่อนเรียน 4 ตัวเลือก มีเวลานับถอยหลัง บันทึก Baseline
3. /lessons/[lessonCode]/learn: วิดีโอ YouTube Player บันทึกความก้าวหน้าการดู และไฟล์สไลด์ PDF ดาวน์โหลด
4. /lessons/[lessonCode]/post-test: ข้อสอบหลังเรียน เกณฑ์ผ่าน 80% จำกัดจำนวนครั้ง (Attempts)
5. /lessons/[lessonCode]/result: เปรียบเทียบผลคะแนน Pre vs Post, คะแนนพัฒนาการ (+%), และปุ่มพิมพ์ใบประกาศนียบัตร (Print Certificate)

### 5. Admin CMS Console (/admin/...)
- /admin/lessons: แดชบอร์ดรายวิชา, การ์ด KPI สถิติ (ทั้งหมด, เผยแพร่, ฉบับร่าง, สื่อรวม), ตารางจัดการบทเรียน, ปุ่มสร้างบทเรียนใหม่แบบรันรหัสอัตโนมัติ (เช่น IDTLM-001...), ปุ่มลบบทเรียน, และปุ่ม Sync ข้อมูลขึ้น Supabase Cloud
- /admin/lessons/[id]/metadata: แก้ไขชื่อ คำอธิบาย วัตถุประสงค์
- /admin/lessons/[id]/content: จัดการคลิปวิดีโอและไฟล์เอกสารแนบ
- /admin/quizzes/[id]: Quiz Builder เพิ่ม/แก้ไขข้อสอบ 4 ตัวเลือก กำหนดเฉลยและคำอธิบาย
- /admin/announcements: จัดการข่าวประกาศรายวิชา
- /admin/users: ตรวจสอบรายชื่อผู้เรียน ดูคะแนน และสลับสิทธิ์ Admin/Student

โปรดสร้างโครงสร้างโปรเจกต์ตามสถาปัตยกรรมนี้ โดยเขียนโค้ดเต็ม ไม่ตัดทอนฟังก์ชัน และให้พร้อมรันคำสั่ง npm run build ผ่าน 100% โดยไม่มีข้อผิดพลาด!
```

---
*เอกสารนี้ถูกจัดทำขึ้นสำหรับโปรเจกต์ EDTech LMS พัฒนาเพื่อการเรียนรู้ดิจิทัลที่มีประสิทธิภาพสูงสุด*
