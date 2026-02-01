import React from 'react';
import { Navbar } from '../components/Navbar';
import { HomeHero } from '../components/HomeHero';
import { AboutSection } from '../components/AboutSection';
import { ContactSection } from '../components/ContactSection';
import { LandingFooter } from '../components/LandingFooter';
import { Helmet } from 'react-helmet-async';

export const LandingPage = () => {
    return (
        <>
            <Helmet>
                <title>SAKINAH - Experience Peace in Healthcare</title>
                <meta name="description" content="Experience peace in care with Sakinah. A calm healthcare platform dedicated to patient well-being." />
            </Helmet>

            <Navbar />
            <main>
                <HomeHero bgImage={`${import.meta.env.BASE_URL}home-bg.png`} />
                <AboutSection />
                <ContactSection />
            </main>
            <LandingFooter />
        </>
    );
};
