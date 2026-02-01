import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Box, Typography, Container } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import GroupsIcon from '@mui/icons-material/Groups';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import VerifiedIcon from '@mui/icons-material/Verified';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const SectionWrapper = styled.section`
  padding: 120px 0;
  background: linear-gradient(180deg, #f8fbfb 0%, #ffffff 50%, #f0f7f7 100%);
  position: relative;
  overflow: hidden;
`;

const DecorativeCircle = styled.div`
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(45, 149, 150, 0.1) 0%, rgba(45, 149, 150, 0.05) 100%);
  animation: ${pulse} 4s ease-in-out infinite;

  &.circle1 {
    width: 400px;
    height: 400px;
    top: -100px;
    right: -100px;
  }

  &.circle2 {
    width: 300px;
    height: 300px;
    bottom: -50px;
    left: -50px;
    animation-delay: 1s;
  }
`;

const SectionHeader = styled(Box)`
  text-align: center;
  margin-bottom: 80px;
  position: relative;
  z-index: 1;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(45, 149, 150, 0.15) 0%, rgba(45, 149, 150, 0.08) 100%);
  color: #2D9596;
  padding: 10px 24px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 2px;
  margin-bottom: 24px;
  border: 1px solid rgba(45, 149, 150, 0.2);
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(Box)`
  text-align: center;
  padding: 48px 28px;
  border-radius: 24px;
  background: white;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(45, 149, 150, 0.1);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #2D9596 0%, #4DB6AC 50%, #80CBC4 100%);
    transform: scaleX(0);
    transition: transform 0.4s ease;
  }

  &:hover {
    transform: translateY(-12px);
    box-shadow: 0 24px 48px rgba(45, 149, 150, 0.15);
    border-color: transparent;

    &::before {
      transform: scaleX(1);
    }
  }
`;

const IconWrapper = styled(Box)`
  width: 88px;
  height: 88px;
  border-radius: 24px;
  background: linear-gradient(135deg, #2D9596 0%, #4DB6AC 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 28px;
  position: relative;
  animation: ${float} 3s ease-in-out infinite;
  box-shadow: 0 12px 24px rgba(45, 149, 150, 0.3);

  &::after {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 28px;
    background: linear-gradient(135deg, rgba(45, 149, 150, 0.3) 0%, transparent 100%);
    z-index: -1;
  }

  svg {
    font-size: 40px;
    color: white;
  }
`;

const StatsSection = styled(Box)`
  margin-top: 100px;
  padding: 60px 0;
  background: linear-gradient(135deg, #1a3e72 0%, #0d2240 100%);
  border-radius: 32px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  position: relative;
  z-index: 1;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const StatItem = styled(Box)`
  text-align: center;
  color: white;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -16px;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 60px;
    background: rgba(255, 255, 255, 0.15);

    @media (max-width: 900px) {
      display: none;
    }
  }
`;

const StatIcon = styled(Box)`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(45, 149, 150, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;

  svg {
    font-size: 28px;
    color: #4DB6AC;
  }
`;

const features = [
  {
    icon: <LocalHospitalIcon />,
    title: 'Comprehensive Care',
    description: 'Manage patients, appointments, and prescriptions all in one integrated platform designed for healthcare professionals.'
  },
  {
    icon: <SecurityIcon />,
    title: 'Secure & Private',
    description: 'Your data is protected with industry-standard security. Patient information stays confidential and safe.'
  },
  {
    icon: <SpeedIcon />,
    title: 'Fast & Efficient',
    description: 'Streamline your workflow with intuitive interfaces and quick access to all essential medical records.'
  },
  {
    icon: <SupportAgentIcon />,
    title: '24/7 Support',
    description: 'Our dedicated support team is always ready to help you with any questions or technical issues.'
  }
];

const stats = [
  { icon: <GroupsIcon />, value: '10,000+', label: 'Active Users' },
  { icon: <EventAvailableIcon />, value: '500K+', label: 'Appointments' },
  { icon: <MedicalInformationIcon />, value: '1M+', label: 'Records Managed' },
  { icon: <VerifiedIcon />, value: '99.9%', label: 'Uptime' }
];

export const AboutSection = () => {
  return (
    <SectionWrapper id="about">
      <DecorativeCircle className="circle1" />
      <DecorativeCircle className="circle2" />

      <Container maxWidth="lg">
        <SectionHeader>
          <Badge>
            <VerifiedIcon sx={{ fontSize: 18 }} />
            ABOUT SAKINAH
          </Badge>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: '#1a3e72',
              mb: 3,
              fontSize: { xs: '2rem', md: '3rem' },
              lineHeight: 1.2
            }}
          >
            Experience Peace in
            <Box component="span" sx={{ color: '#2D9596', display: 'block' }}>
              Healthcare Management
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 680,
              mx: 'auto',
              lineHeight: 1.9,
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.15rem' }
            }}
          >
            SAKINAH is a modern Electronic Medical Records system designed to bring
            tranquility to healthcare management. We believe that technology should
            simplify care, not complicate it.
          </Typography>
        </SectionHeader>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index} sx={{ animationDelay: `${index * 0.1}s` }}>
              <IconWrapper sx={{ animationDelay: `${index * 0.2}s` }}>
                {feature.icon}
              </IconWrapper>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: '#1a3e72',
                  mb: 2,
                  fontSize: '1.1rem'
                }}
              >
                {feature.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.8,
                  fontSize: '0.95rem'
                }}
              >
                {feature.description}
              </Typography>
            </FeatureCard>
          ))}
        </FeaturesGrid>

        <StatsSection>
          <Container>
            <StatsGrid>
              {stats.map((stat, index) => (
                <StatItem key={index}>
                  <StatIcon>
                    {stat.icon}
                  </StatIcon>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      background: 'linear-gradient(135deg, #fff 0%, #4DB6AC 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      opacity: 0.8,
                      fontWeight: 500,
                      letterSpacing: 0.5
                    }}
                  >
                    {stat.label}
                  </Typography>
                </StatItem>
              ))}
            </StatsGrid>
          </Container>
        </StatsSection>
      </Container>
    </SectionWrapper>
  );
};
