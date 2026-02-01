import React from 'react';
import styled from 'styled-components';
import { Box, Typography, Container, Grid, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const FooterWrapper = styled.footer`
  background: linear-gradient(135deg, #1a3e72 0%, #0d2240 100%);
  color: white;
  padding: 80px 0 0;
`;

const FooterTop = styled(Box)`
  padding-bottom: 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const FooterBottom = styled(Box)`
  padding: 24px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const Logo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  img {
    height: 50px;
  }

  span {
    font-size: 1.5rem;
    font-weight: 800;
    color: #2D9596;
    letter-spacing: 2px;
  }
`;

const FooterLink = styled.a`
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  display: block;
  margin-bottom: 12px;
  transition: color 0.2s ease;
  cursor: pointer;

  &:hover {
    color: #2D9596;
  }
`;

const SocialButton = styled(IconButton)`
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  margin-right: 8px !important;
  transition: all 0.2s ease !important;

  &:hover {
    background: #2D9596 !important;
    transform: translateY(-3px);
  }
`;

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterWrapper>
      <Container maxWidth="lg">
        <FooterTop>
          <Grid container spacing={4}>
            {/* Brand Column */}
            <Grid item xs={12} md={4}>
              <Logo>
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="SAKINAH Logo" />
                <span>SAKINAH</span>
              </Logo>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.8,
                  mb: 3,
                  maxWidth: 300
                }}
              >
                Experience peace in healthcare management.
                SAKINAH brings tranquility to medical practice
                with modern, intuitive tools for healthcare professionals.
              </Typography>
              <Box>
                <SocialButton size="small">
                  <FacebookIcon fontSize="small" />
                </SocialButton>
                <SocialButton size="small">
                  <TwitterIcon fontSize="small" />
                </SocialButton>
                <SocialButton size="small">
                  <LinkedInIcon fontSize="small" />
                </SocialButton>
                <SocialButton size="small">
                  <InstagramIcon fontSize="small" />
                </SocialButton>
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 3, color: 'white' }}
              >
                Quick Links
              </Typography>
              <FooterLink onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Home
              </FooterLink>
              <FooterLink onClick={() => scrollToSection('about')}>
                About Us
              </FooterLink>
              <FooterLink onClick={() => scrollToSection('contact')}>
                Contact
              </FooterLink>
              <FooterLink as={RouterLink} to="/signin">
                Sign In
              </FooterLink>
            </Grid>

            {/* Services */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 3, color: 'white' }}
              >
                Services
              </Typography>
              <FooterLink>Patient Management</FooterLink>
              <FooterLink>Appointments</FooterLink>
              <FooterLink>Prescriptions</FooterLink>
              <FooterLink>Medical Records</FooterLink>
            </Grid>

            {/* Legal */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 3, color: 'white' }}
              >
                Legal
              </Typography>
              <FooterLink>Privacy Policy</FooterLink>
              <FooterLink>Terms of Service</FooterLink>
              <FooterLink>HIPAA Compliance</FooterLink>
              <FooterLink>Cookie Policy</FooterLink>
            </Grid>

            {/* Contact */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 3, color: 'white' }}
              >
                Contact
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                support@sakinah.health
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                +1 (555) 123-4567
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                123 Health Avenue,<br />
                Medical District
              </Typography>
            </Grid>
          </Grid>
        </FooterTop>

        <FooterBottom>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            {currentYear} SAKINAH. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
            Made with care for healthcare professionals
          </Typography>
        </FooterBottom>
      </Container>
    </FooterWrapper>
  );
};
