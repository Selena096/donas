/* ============================================
   CAPRICHART — DESIGN TOKENS
   ============================================ */

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');

:root {
  /* ── BRAND COLORS ── */
  --pink:        #F4637A;
  --pink-light:  #FFD6DE;
  --pink-soft:   #FFF0F3;
  --cream:       #FFF8F0;
  --warm:        #FFF3EA;

  /* ── GOURMET PALETTE ── */
  --noir:        #0D0D1A;
  --noir-2:      #13131F;
  --noir-3:      #1C1C2E;
  --champagne:   #E8C4C4;
  --champagne-2: #F2DEDE;
  --champagne-dim: rgba(232,196,196,0.15);

  /* ── NEUTRALS ── */
  --text:        #1E1E1E;
  --text-soft:   #5A5A5A;
  --muted:       #9A9A9A;
  --border:      #EDE5DF;
  --white:       #FFFFFF;

  /* ── TYPOGRAPHY ── */
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;

  /* ── TYPE SCALE ── */
  --text-xs:   11px;
  --text-sm:   13px;
  --text-base: 15px;
  --text-md:   17px;
  --text-lg:   20px;
  --text-xl:   clamp(24px, 5vw, 36px);
  --text-2xl:  clamp(30px, 7vw, 52px);
  --text-3xl:  clamp(38px, 9vw, 68px);

  /* ── SPACING ── */
  --space-xs:  8px;
  --space-sm:  12px;
  --space-md:  20px;
  --space-lg:  32px;
  --space-xl:  56px;
  --space-2xl: 88px;

  /* ── RADIUS ── */
  --r-sm:   8px;
  --r-md:   14px;
  --r-lg:   20px;
  --r-xl:   28px;
  --r-full: 999px;

  /* ── SHADOWS ── */
  --shadow-sm:   0 2px 8px rgba(0,0,0,.06);
  --shadow-md:   0 6px 24px rgba(0,0,0,.09);
  --shadow-pink: 0 8px 28px rgba(244,99,122,.30);
  --shadow-champ:0 8px 32px rgba(232,196,196,.20);

  /* ── TRANSITIONS ── */
  --ease: cubic-bezier(.25,.46,.45,.94);
  --transition: 200ms var(--ease);
}
