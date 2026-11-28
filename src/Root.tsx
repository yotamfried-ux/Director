import React from 'react';
import {Composition} from 'remotion';
import {Promo, PromoProps} from './Promo';
import {Site, SiteProps} from './Site';
import {Showcase, ShowcaseProps} from './Showcase';
import {ToriSiteLong} from './ToriSite';
import {SportReelSite} from './SportReelSite';
import {SportReelSite2} from './SportReelSite2';
import {SportReelSite3} from './SportReelSite3';
import {SportReelSite4} from './SportReelSite4';
import {SportReelSite5} from './SportReelSite5';
import {ChurnJourney} from './ChurnJourney';
import {ChurnOverviewB} from './ChurnOverviewB';
import {ChurnStyleA, ChurnStyleB, ChurnStyleC} from './ChurnStyles';
import {ChurnOverview} from './ChurnOverview';
import {AgentSystemSite} from './AgentSystem';
import {AgentSystemShell} from './AgentSystemShell';
import {AgentSystemBench, BENCH_FRAMES} from './AgentSystemBench';
import {ToriReelBook, ToriReelOwner, ToriReelWaitlist, REEL_FRAMES} from './Reels';

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
    <Composition id="ToriReel-book" component={ToriReelBook} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ToriReel-owner" component={ToriReelOwner} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="ToriReel-waitlist" component={ToriReelWaitlist} durationInFrames={REEL_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="AgentSystemBench-he" component={AgentSystemBench} durationInFrames={BENCH_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="AgentSystemShell-he" component={AgentSystemShell} durationInFrames={900} fps={30} width={1920} height={1080} />
    <Composition id="AgentSystem-site-he" component={AgentSystemSite} durationInFrames={900} fps={30} width={1920} height={1080} />
    <Composition id="Churn-style-A" component={ChurnStyleA} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Churn-style-B" component={ChurnStyleB} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Churn-style-C" component={ChurnStyleC} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Churn-overview-he" component={ChurnOverview} durationInFrames={1185} fps={30} width={1920} height={1080} defaultProps={{locale: 'he' as const}} />
    <Composition id="Churn-overview-en" component={ChurnOverview} durationInFrames={1185} fps={30} width={1920} height={1080} defaultProps={{locale: 'en' as const}} />
    <Composition id="Churn-overview-B-he" component={ChurnOverviewB} durationInFrames={1185} fps={30} width={1920} height={1080} defaultProps={{locale: 'he' as const}} />
    <Composition id="Churn-overview-B-en" component={ChurnOverviewB} durationInFrames={1185} fps={30} width={1920} height={1080} defaultProps={{locale: 'en' as const}} />
    <Composition id="Churn-journey-he" component={ChurnJourney} durationInFrames={888} fps={30} width={1920} height={1080} defaultProps={{locale: 'he' as const}} />
    <Composition id="Churn-journey-en" component={ChurnJourney} durationInFrames={888} fps={30} width={1920} height={1080} defaultProps={{locale: 'en' as const}} />
    <Composition id="Promo-16x9" component={Promo} durationInFrames={240} fps={24} width={1920} height={1080} defaultProps={defaults} />
    <Composition id="Promo-9x16" component={Promo} durationInFrames={240} fps={24} width={1080} height={1920} defaultProps={defaults} />
    <Composition id="Promo-1x1" component={Promo} durationInFrames={240} fps={24} width={1080} height={1080} defaultProps={defaults} />
    <Composition id="Site-he" component={Site} durationInFrames={240} fps={30} width={1280} height={720} defaultProps={siteHe} />
    <Composition id="Site-en" component={Site} durationInFrames={240} fps={30} width={1280} height={720} defaultProps={siteEn} />
    <Composition id="ToriSite-long-he" component={ToriSiteLong} durationInFrames={1260} fps={30} width={1920} height={1080} defaultProps={{lang: 'he' as const, accent: '#4fd1bb', bg: '#050d0e'}} />
    <Composition id="ToriSite-long-en" component={ToriSiteLong} durationInFrames={1260} fps={30} width={1920} height={1080} defaultProps={{lang: 'en' as const, accent: '#4fd1bb', bg: '#050d0e'}} />
    <Composition id="Showcase-9x16" component={Showcase} durationInFrames={820} fps={30} width={1080} height={1920} defaultProps={showcaseHe} />
    <Composition id="SportReel5-short-en" component={SportReelSite5} durationInFrames={336} fps={30} width={1920} height={1080} defaultProps={{locale: 'en' as const, variant: 'short' as const}} />
    <Composition id="SportReel5-short-he" component={SportReelSite5} durationInFrames={336} fps={30} width={1920} height={1080} defaultProps={{locale: 'he' as const, variant: 'short' as const}} />
    <Composition id="SportReel5-long-en" component={SportReelSite5} durationInFrames={902} fps={30} width={1920} height={1080} defaultProps={{locale: 'en' as const, variant: 'long' as const}} />
    <Composition id="SportReel5-long-he" component={SportReelSite5} durationInFrames={902} fps={30} width={1920} height={1080} defaultProps={{locale: 'he' as const, variant: 'long' as const}} />
    <Composition id="SportReel-short-en" component={SportReelSite4} durationInFrames={330} fps={30} width={1920} height={1080} defaultProps={{locale: 'en' as const, variant: 'short' as const}} />
    <Composition id="SportReel-short-he" component={SportReelSite4} durationInFrames={330} fps={30} width={1920} height={1080} defaultProps={{locale: 'he' as const, variant: 'short' as const}} />
    <Composition id="SportReel-long-en" component={SportReelSite4} durationInFrames={916} fps={30} width={1920} height={1080} defaultProps={{locale: 'en' as const, variant: 'long' as const}} />
    <Composition id="SportReel-long-he" component={SportReelSite4} durationInFrames={916} fps={30} width={1920} height={1080} defaultProps={{locale: 'he' as const, variant: 'long' as const}} />
    <Composition id="SportReel-site-v3" component={SportReelSite3} durationInFrames={730} fps={30} width={1920} height={1080} defaultProps={{name: 'SportReel'}} />
    <Composition id="SportReel-site-v2" component={SportReelSite2} durationInFrames={730} fps={30} width={1920} height={1080} defaultProps={{name: 'SportReel'}} />
      <Composition id="SportReel-site" component={SportReelSite} durationInFrames={480} fps={30} width={1920} height={1080} defaultProps={{name: 'SportReel'}} />
  </>
);
