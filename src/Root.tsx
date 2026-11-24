import React from 'react';
import {Composition} from 'remotion';
import {Promo, PromoProps} from './Promo';
import {Site, SiteProps} from './Site';
import {Showcase, ShowcaseProps} from './Showcase';

const defaults: PromoProps = {
  name: 'TORI',
  tagline: 'ניהול יומן ותורים',
  accent: '#4fd1bb',
  bg: '#050d0e',
  cap1: 'הלקוח בוחר שעה פנויה',
  cap2: 'התור נקבע ומאושר',
  cap3: 'והיומן שלך מתעדכן מיד',
};

const siteBase = {name: 'TORI', accent: '#4fd1bb', bg: '#050d0e', showText: true};
const siteHe: SiteProps = {...siteBase, lang: 'he', tagline: 'ניהול יומן ותורים', cap1: 'הלקוח בוחר שעה פנויה', cap2: 'התור נקבע ומאושר', cap3: 'היומן מתעדכן מיד'};
const siteEn: SiteProps = {...siteBase, lang: 'en', tagline: 'Appointments & calendar', cap1: 'Client picks a free slot', cap2: 'Booking confirmed', cap3: 'Calendar updates instantly'};

const showcaseHe: ShowcaseProps = {
  name: 'TORI', tagline: 'ניהול יומן ותורים', accent: '#4fd1bb', bg: '#050d0e',
  caps: [
    {t: 'הלקוח בוחר שירות ויום', a: 6, b: 76},
    {t: 'ורואה רק שעות פנויות', a: 80, b: 132},
    {t: 'ומקבל אישור מיידי', a: 138, b: 178},
    {t: 'ובצד העסק, התור כבר ביומן', a: 186, b: 238},
    {t: 'יומן שבועי עם תפוסה ושעות פנויות', a: 248, b: 312},
    {t: 'תזכורות ורשימת המתנה, הכול אוטומטי', a: 346, b: 458},
    {t: 'ודוחות ברורים על מה שקורה בעסק', a: 510, b: 612},
  ],
};

export const Root: React.FC = () => (
  <>
    <Composition id="Promo-16x9" component={Promo} durationInFrames={240} fps={24} width={1920} height={1080} defaultProps={defaults} />
    <Composition id="Promo-9x16" component={Promo} durationInFrames={240} fps={24} width={1080} height={1920} defaultProps={defaults} />
    <Composition id="Promo-1x1" component={Promo} durationInFrames={240} fps={24} width={1080} height={1080} defaultProps={defaults} />
    <Composition id="Site-he" component={Site} durationInFrames={240} fps={30} width={1280} height={720} defaultProps={siteHe} />
    <Composition id="Site-en" component={Site} durationInFrames={240} fps={30} width={1280} height={720} defaultProps={siteEn} />
    <Composition id="Showcase-9x16" component={Showcase} durationInFrames={820} fps={30} width={1080} height={1920} defaultProps={showcaseHe} />
  </>
);
