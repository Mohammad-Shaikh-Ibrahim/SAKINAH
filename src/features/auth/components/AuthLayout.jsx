import React from 'react';
import styled from 'styled-components';
import { Box, Paper, Typography, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const AuthWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('${import.meta.env.BASE_URL}home-bg.png') no-repeat center center;
  background-size: cover;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%);
  }
`;

const ContentBox = styled(Paper)`
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 450px;
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
`;

const LogoWrapper = styled(RouterLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-decoration: none;
  margin-bottom: 32px;
  
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

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <AuthWrapper>
      <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center' }}>
        <ContentBox elevation={0}>
          <LogoWrapper to="/">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Sakinah" />
            <span>SAKINAH</span>
          </LogoWrapper>

          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="700" color="text.primary" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {children}
        </ContentBox>
      </Container>
    </AuthWrapper>
  );
};
