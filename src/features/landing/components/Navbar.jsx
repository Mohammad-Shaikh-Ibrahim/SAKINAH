import React from 'react';
import styled from 'styled-components';
import { StyledButton } from '../../../shared/ui/StyledButton';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Typography } from '@mui/material';
import { selectAuth, logout } from '../../auth/store/authSlice';

const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
`;

const NavContent = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #2D9596;
  letter-spacing: 2px;
  cursor: pointer;

  &, & * {
    border: none !important;
    border-left: none !important;
    border-right: none !important;
    outline: none !important;
    text-decoration: none !important;
    box-shadow: none !important;
  }

  img {
    height: 60px;
    display: block;
    margin: 0;
    padding: 0;
    margin-right: 12px;
  }

  span {
    display: block;
    margin: 0;
    padding: 0;
  }

  &::before, &::after {
    content: none !important;
    display: none !important;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
`;

export const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(selectAuth);
  return (
    <NavContainer>
      <NavContent>
        <Logo as={RouterLink} to="/">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="SAKINAH Logo" />
          <span>SAKINAH</span>
        </Logo>
        <ButtonGroup>
          {!isAuthenticated ? (
            <>
              <StyledButton variant="ghost" as={RouterLink} to="/signin">
                Sign In
              </StyledButton>
              <StyledButton variant="primary" as={RouterLink} to="/signup">
                Sign Up
              </StyledButton>
            </>
          ) : (
            <>
              <Typography variant="body2" sx={{ alignSelf: 'center', mr: 2, color: '#2D9596', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Hi, {user?.fullName?.split(' ')[0]}
              </Typography>
              <StyledButton variant="secondary" as={RouterLink} to="/dashboard">
                Dashboard
              </StyledButton>
              <StyledButton variant="ghost" onClick={() => dispatch(logout())}>
                Logout
              </StyledButton>
            </>
          )}
        </ButtonGroup>
      </NavContent>
    </NavContainer>
  );
};
