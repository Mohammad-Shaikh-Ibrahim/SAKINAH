import React from 'react';
import styled from 'styled-components';
import { StyledButton } from '../../../shared/ui/StyledButton';

const HeroWrapper = styled.section`
  height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('${(props) => props.bgImage}') no-repeat center center;
  background-size: cover;
  overflow: hidden;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%);
  z-index: 1;
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
  max-width: 800px;
  text-align: center;
  padding: 0 24px;
`;

const Headline = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  color: #333;
  margin-bottom: 24px;
  line-height: 1.1;
  
  span {
    color: #2D9596;
  }
`;

const Quote = styled.p`
  font-style: italic;
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 16px;
  font-family: serif;
`;

const Paragraph = styled.p`
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 40px;
  line-height: 1.6;
  max-width: 600px;
  margin-inline: auto;
`;

const CTAWrapper = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export const HomeHero = ({ bgImage }) => {
    return (
        <HeroWrapper bgImage={bgImage}>
            <Overlay />
            <Content>
                <Quote>"Ultimately, healing means bringing peace to our souls."</Quote>
                <Headline>SAKINAH <span>Experience Peace in Care.</span></Headline>
                <Paragraph>
                    A calm healthcare platform focused on compassionate care, peace, and patient well-being.
                    Dedicated to your health and peace of mind.
                </Paragraph>
                <CTAWrapper>
                    <StyledButton variant="primary" size="large" onClick={() => scrollToSection('about')}>
                        About
                    </StyledButton>
                    <StyledButton variant="secondary" size="large" onClick={() => scrollToSection('contact')}>
                        Contact Us
                    </StyledButton>
                </CTAWrapper>
            </Content>
        </HeroWrapper>
    );
};
