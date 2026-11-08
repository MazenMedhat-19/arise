# ARISE — Personal System

تطبيق شخصي (PWA) بيشتغل على الآيفون زي أي تطبيق عادي: تتبع الأكل والماكروز بالباركود، جدول الجيم، تأهيل الرباط الصليبي، جدول الجامعة، ونظام ليفلات بستايل Solo Leveling.

## 1) ارفعه على GitHub Pages (مرة واحدة — 5 دقايق)

1. اعمل حساب على https://github.com لو مش عندك.
2. اعمل repository جديد اسمه `arise` (Public — GitHub Pages المجاني محتاج Public. بياناتك الشخصية **مش** بتترفع، بتتحفظ على تليفونك بس).
3. من الكمبيوتر، جوه فولدر `arise`:

```bash
git init
```
```bash
git add .
```
```bash
git commit -m "ARISE v1"
```
```bash
git branch -M main
```
```bash
git remote add origin https://github.com/USERNAME/arise.git
```
```bash
git push -u origin main
```

4. في GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
5. بعد دقيقة هيبقى اللينك: `https://USERNAME.github.io/arise/`

## 2) نزّله على الآيفون

1. افتح اللينك من **Safari** (لازم Safari).
2. اضغط زرار المشاركة ⬆️ ← **Add to Home Screen** ← Add.
3. افتح ARISE من الشاشة الرئيسية — هيفتح Full screen من غير شريط Safari، وبيشتغل أوفلاين.
4. أول مرة تفتح الكاميرا للباركود هيطلب إذن — اضغط Allow.

> بعد أي تحديث للكود: `git add . && git commit -m "update" && git push` — والتطبيق بيتحدّث لوحده أول ما تفتحه وانت متصل بالنت.

## 3) مزامنة Google Calendar + Gmail (اختياري)

1. ادخل https://console.cloud.google.com ← اعمل Project جديد.
2. **APIs & Services → Library**: فعّل **Google Calendar API** و **Gmail API**.
3. **OAuth consent screen**: External ← حط اسمك وإيميلك ← في **Test users** ضيف إيميلك.
4. **Credentials → Create credentials → OAuth client ID → Web application**
   - Authorized JavaScript origins: `https://USERNAME.github.io`
5. انسخ الـ Client ID ← في ARISE: Settings ← Google sync ← الصقه ← Save ← Plan → Sync → Connect Google.

الصلاحيات قراءة بس (readonly). جوجل هيقولك "unverified app" — ده طبيعي لأنه تطبيقك انت، اضغط Continue.

## 4) تذكيرات على الآيفون

Plan → Sync → **Export to Calendar** بيعمل ملف .ics فيه محاضراتك ومواعيد الجيم بتتكرر كل أسبوع + تنبيه قبلها بربع ساعة + تنبيه قبل كل امتحان بيوم. افتحه واختار Add All.

## 5) Backup

البيانات كلها على التليفون. من Settings → Backup → **Export** كل أسبوعين وابعته لنفسك على Drive. لو غيرت التليفون: Import.

## Structure

```
index.html            app shell + iOS meta tags
css/style.css         "System" theme
js/data.js            foods (Egyptian staples), legends' quotes, training split, ACL phases
js/app.js             app logic: XP/quests, fuel, train, rehab, plan, Google, ICS
sw.js                 offline cache
manifest.webmanifest  install metadata
```

Food barcode data comes from [Open Food Facts](https://world.openfoodfacts.org) (free, open). Scanner: html5-qrcode.

**Medical note:** the ACL plan is a general, criteria-based protocol. Progress phases when your physiotherapist or surgeon clears you.
