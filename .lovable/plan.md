
# Bezpecnostne vylepsenia pre Cok Tech

Po detailnej analyze celej stranky som identifikoval niekolko oblasti, kde mozno zvysit bezpecnost. Databaza ma uz solidne RLS politiky, ale na frontende a formularoch su medzery.

---

## 1. Honeypot anti-spam ochrana formularov

**Problem:** Kontaktny formular, rezervacny modal a booking formular nemaju ziadnu ochranu proti botom. Hocikto moze automaticky posielat spam do databazy.

**Riesenie:** Pridat neviditelne "honeypot" pole do kazdeho formulara. Boti ho vyplnia, ludia nie. Ak je vyplnene, formular sa ticho ignoruje.

- `Contact.tsx` - pridat skryte pole, kontrola pred odoslanim
- `ReservationModal.tsx` - to iste
- `KonfiguratorModal.tsx` - to iste

---

## 2. Rate limiting na formulare (client-side)

**Problem:** Uzivatel alebo bot moze odoslat desiatky sprav za sekundu.

**Riesenie:** Pridat jednoduchy rate limiter - po odoslani formulara zablokovat tlacidlo na 30 sekund s odpoctom. Toto nie je nahradzka serveroveho rate limitingu, ale znici vacsinu jednoduchych botov.

---

## 3. Security headers cez meta tagy

**Problem:** Chybaju zakladne bezpecnostne meta tagy v `index.html`.

**Riesenie:** Pridat do `index.html`:
- `<meta http-equiv="X-Content-Type-Options" content="nosniff">`
- `<meta name="referrer" content="strict-origin-when-cross-origin">`
- Referrer policy pre ochranu URL pri odkazoch na externe stranky

---

## 4. Admin route obfuskacia

**Problem:** Admin panel je na `/a7x9k2m` - uz je obfuskovany, co je dobre. Ale ak niekto najde URL, vidi login formular. 

**Riesenie:** Pridat brute-force ochranu - po 5 neuspesnych pokusoch o prihlasenie zablokovat formular na 5 minut s odpoctom. Ulozit pocitadlo do `sessionStorage`.

---

## 5. Zapnut Leaked Password Protection

**Problem:** Databazovy linter ukazuje, ze ochrana proti uniklym heslam je vypnuta.

**Riesenie:** Aktivovat leaked password protection v konfiguraci autentifikacie - toto zabrani uzivatelom pouzivat hesla, ktore boli kompromitovane v znamych unikoch dat.

---

## 6. Content Security - Sanitizacia vstupov

**Problem:** Formulare pouzivaju Zod validaciu (dobre), ale chyba HTML sanitizacia pred zobrazenim v admin paneli.

**Riesenie:** Pridat utility funkciu na HTML escape, ktora sa pouzije pri zobrazovani uzivatelskych dat v admin paneli (mena, spravy, emaily). React sam o sebe escapuje, ale pre extra istotu pri `dangerouslySetInnerHTML` pripadoch.

---

## 7. Externe odkazy - rel="noopener noreferrer"

**Problem:** Niektore externe odkazy nemaju bezpecnostne atributy.

**Riesenie:** Skontrolovat a pridat `rel="noopener noreferrer"` a `target="_blank"` na vsetky externe odkazy.

---

## Technicke detaily implementacie

### Honeypot implementacia
```text
+----------------------------------+
| Formular                         |
| [Meno]  [Email]                  |
| [Skryte pole - CSS display:none] |  <-- Bot toto vyplni
| [Sprava]                         |
| [Odoslat]                        |
+----------------------------------+
         |
    Kontrola: Je honeypot vyplneny?
    Ano -> Ticho ignorovat (fake success)
    Nie -> Normalne odoslat
```

### Rate limiter
```text
Odoslanie -> uloz timestamp do ref
Dalsi pokus -> porovnaj s timestampom
  < 30s -> zablokuj, ukazuj odpocet
  > 30s -> povol
```

### Login brute-force
```text
Neuspesny login -> increment pocitadla (sessionStorage)
  >= 5 -> zablokuj na 5 minut, ukazuj odpocet
  Reset po uspesnom logine
```

### Dotknuté subory
- `src/components/landing/Contact.tsx`
- `src/components/ReservationModal.tsx`
- `src/components/KonfiguratorModal.tsx`
- `src/pages/Admin.tsx`
- `index.html`
- Auth konfiguracia (leaked password protection)

