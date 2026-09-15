import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { getPage } from './lib/api.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import VideoSlider from './components/VideoSlider.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Comparison from './components/Comparison.jsx';
import VideoTestimonials from './components/VideoTestimonials.jsx';
import Pricing from './components/Pricing.jsx';
import FinalCta from './components/FinalCta.jsx';
import Footer from './components/Footer.jsx';
import WhatsAppButton from './components/WhatsAppButton.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderStatus from './pages/OrderStatus.jsx';

const PAGE_SLUG = 'video-insights';

// The server (and Vite in dev) serves index.html for every path, so routing is just the pathname
const path = window.location.pathname.replace(/\/+$/, '') || '/';
const orderMatch = path.match(/^\/order\/([^/]+)$/);


export default function App() {
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getPage(PAGE_SLUG, { signal: controller.signal })
      .then(setPage)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!page) return;
    if (page.title) document.title = page.title;
    AOS.init({ duration: 800, once: true, offset: 100 });
  }, [page]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-display text-2xl font-bold text-primary">We couldn&apos;t load this page.</p>
        <p className="text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-accent px-6 py-2 font-bold text-accent-foreground"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-busy="true">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
      </div>
    );
  }

  const { sections, config } = page;
  const siteUrl = config.siteUrl || '/';

  let content;
  if (path === '/checkout') {
    content = <Checkout site={sections.site} />;
  } else if (orderMatch) {
    content = <OrderStatus orderNumber={decodeURIComponent(orderMatch[1])} site={sections.site} />;
  } else {
    content = (
      <>
        <Hero content={sections.hero} />
        <VideoSlider content={sections.videoSlider} />
        <HowItWorks content={sections.howItWorks} />
        <Comparison content={sections.comparison} />
        <VideoTestimonials content={sections.testimonials} />
        <Pricing content={sections.pricing} />
        <FinalCta content={sections.finalCta} />
      </>
    );
  }

  return (
    <>
      <Header site={sections.site} siteUrl={siteUrl} />
      <main>{content}</main>
      <Footer site={sections.site} siteUrl={siteUrl} />
      <WhatsAppButton phone={sections.site.whatsapp_phone} />
    </>
  );
}
