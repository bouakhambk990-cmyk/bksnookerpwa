# BK Snooker POS V4 — PWA Package

ໄຟລ໌ໃນແພັກເກັດນີ້:

- `index.html` — ໄຟລ໌ POS ຫຼັກ (ປັບປຸງແລ້ວ: ໃສ່ manifest link, iOS/Android meta tags, ແລະ ແກ້ service worker registration ໃຫ້ໃຊ້ໄຟລ໌ຈິງ)
- `manifest.json` — Web App Manifest (ຊື່ແອັບ, ໄອຄອນ, ສີ, display mode)
- `sw.js` — Service Worker ຈິງ (cache app shell + offline fallback)
- `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `apple-touch-icon.png` — ໄອຄອນທີ່ອອກແບບໃຫ້ຄືກັນກັບ brand-mark (ຫົວບານສີຂຽວ) ໃນແອັບເດີມ

## ‼️ ຂໍ້ກຳນົດສຳຄັນ — ຕ້ອງ host ຜ່ານ HTTPS

Browser ບໍ່ອະນຸຍາດໃຫ້ຕິດຕັ້ງ PWA (Add to Home Screen ແບບ standalone) ຖ້າເປີດຈາກ `file://` ຫຼືເປີດຈາກ URL HTTP ທຳມະດາ. **ຕ້ອງ host ດ້ວຍ HTTPS** (localhost ກໍ່ໃຊ້ໄດ້ຕອນທົດສອບ).

ຕົວເລືອກ hosting ທີ່ຟຣີ ແລະ ໄວ (ອັບໂຫຼດທັງໂຟນເດີນີ້ໄດ້ເລີຍ):

1. **Cloudflare Pages** / **Netlify** / **Vercel** — drag & drop ໂຟນເດີນີ້, ໄດ້ HTTPS ໃຫ້ທັນທີ
2. **GitHub Pages** — push ຂຶ້ນ repo ແລ້ວເປີດ Pages
3. **Firebase Hosting** — `firebase deploy`
4. ຖ້າມີ server ຂອງຮ້ານເອງ (ເຊັ່ນ Nginx/Apache) ຕ້ອງມີ SSL certificate (Let's Encrypt ຟຣີ)

## ວິທີທົດສອບ

1. Deploy ໂຟນເດີນີ້ຂຶ້ນ hosting (ໄຟລ໌ທັງໝົດຕ້ອງຢູ່ path ດຽວກັນ — ຢ່າຍ້າຍ manifest.json / sw.js / icons ໄປບ່ອນອື່ນ)
2. ເປີດລິ້ງໃນ Chrome (Android) ຫຼື Safari (iOS)
3. **Android/Chrome**: ຈະມີ prompt "Add to Home Screen" ອັດຕະໂນມັດ ຫຼືກົດປຸ່ມ install ໃນແອັບ (ໂຄ້ດ `App.installPwa` ທີ່ມີຢູ່ແລ້ວໃນ POS ຈະໃຊ້ໄດ້ຈິງແລ້ວ)
4. **iOS/Safari**: ກົດປຸ່ມ Share (□↑) → "Add to Home Screen" (Safari ບໍ່ສະໜັບສະໜູນ auto-prompt, ຕ້ອງກົດເອງ)
5. ເປີດຈາກ home screen — ຈະໄດ້ full-screen ບໍ່ມີ browser bar, ແລະ ໃຊ້ offline ໄດ້ (ຫຼັງຈາກເປີດອອນລາຍຄັ້ງທຳອິດ ເພື່ອໃຫ້ cache ໂຫຼດ)

## ຂໍ້ຄວນຮູ້

- ຂໍ້ມູນ POS (ບານ, stock, transaction) ຍັງເກັບຢູ່ໃນ `localStorage`/browser storage ຂອງອຸປະກອນນັ້ນ — ບໍ່ sync ຂ້າມອຸປະກອນ ຖ້າແອັບເດີມບໍ່ໄດ້ຕໍ່ backend/cloud
- ຖ້າອັບເດດ `index.html` ໃນອະນາຄົດ, service worker ໃຊ້ນະໂຍບາຍ **network-first** ສຳລັບ app shell — ພະນັກງານຈະໄດ້ເວີຊັນໃໝ່ອັດຕະໂນມັດທຸກຄັ້ງທີ່ມີເນັດ, ແລະ fallback ເປັນ cache ເມື່ອອອຟລາຍ
- ຖ້າຕ້ອງການປ່ຽນໄອຄອນ (ໃສ່ໂລໂກ້ຮ້ານແທ້ໆ), ພຽງແທນທີ່ໄຟລ໌ `icon-192.png` ແລະ `icon-512.png` ດ້ວຍຂະໜາດດຽວກັນ
