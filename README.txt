راهنمای استفاده

1) هر چهار فایل را در ریشه مخزن GitHub خود قرار دهید:
   - index.html
   - style.css
   - script.js
   - README.txt

2) داخل فایل script.js این سه مقدار را ویرایش کنید:

const githubUsername = "USERNAME";
const repositoryName = "REPOSITORY";
const imagesFolder = "images/slider";

3) در مخزن خود پوشه زیر را بسازید:

images/slider

4) عکس‌ها را با نام‌های مرتب داخل آن قرار دهید:

01-first-slide.jpg
02-second-slide.jpg
03-third-slide.webp

5) برای تغییر زمان هر اسلاید، در script.js مقدار زیر را عوض کنید:

const autoplayDelay = 6000;

6000 یعنی 6 ثانیه.

6) مخزن باید Public باشد تا GitHub API بتواند تصاویر را نمایش دهد.

7) برای فعال‌سازی GitHub Pages:

Settings > Pages
Source: Deploy from a branch
Branch: main
Folder: /root
