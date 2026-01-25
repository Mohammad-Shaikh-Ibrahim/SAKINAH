import React from 'react';
import { Navbar } from '../components/Navbar';
import { HomeHero } from '../components/HomeHero';
import { Helmet } from 'react-helmet-async';

export const LandingPage = () => {
    return (
        <>
            <Helmet>
                <title>SAKINAH</title>
                <meta name="description" content="Experience peace in care with Sakinah. A calm healthcare platform dedicated to patient well-being." />
            </Helmet>

            <Navbar />
            <main>
                <HomeHero bgImage={`${import.meta.env.BASE_URL}home-bg.png`} />
            </main>
        </>
    );
};
