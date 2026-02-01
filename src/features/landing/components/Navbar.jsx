import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { StyledButton } from '../../../shared/ui/StyledButton';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Typography, IconButton } from '@mui/material';
import { selectAuth, logout } from '../../auth/store/authSlice';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 0 16px;
  }
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

    @media (max-width: 768px) {
      height: 50px;
      margin-right: 8px;
    }
  }

  span {
    display: block;
    margin: 0;
    padding: 0;

    @media (max-width: 480px) {
      display: none;
    }
  }

  &::before, &::after {
    content: none !important;
    display: none !important;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileMenuButton = styled(IconButton)`
  display: none !important;
  color: #1a3e72 !important;

  @media (max-width: 768px) {
    display: flex !important;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const MobileMenu = styled.div`
  display: none;
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 999;
  animation: ${slideIn} 0.3s ease;

  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
`;

const MobileMenuContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MobileMenuItem = styled.div`
  width: 100%;

  a, button {
    width: 100%;
    justify-content: center;
  }
`;

const MobileDivider = styled.div`
  height: 1px;
  background: #e0e0e0;
  margin: 8px 0;
`;

const MobileUserGreeting = styled.div`
  text-align: center;
  padding: 12px;
  background: linear-gradient(135deg, rgba(45, 149, 150, 0.1) 0%, rgba(45, 149, 150, 0.05) 100%);
  border-radius: 12px;
  margin-bottom: 8px;
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 998;

  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
`;

export const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(selectAuth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <NavContainer>
        <NavContent>
          <Logo as={RouterLink} to="/" onClick={closeMobileMenu}>
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="SAKINAH Logo" />
            <span>SAKINAH</span>
          </Logo>

          {/* Desktop Menu */}
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
                <StyledButton variant="secondary" as={RouterLink} to="/dashboard">
                  Dashboard
                </StyledButton>
                <Typography variant="body2" sx={{ color: '#2D9596', fontWeight: 600 }}>
                  Hi, {user?.fullName?.split(' ')[0]}
                </Typography>
                <StyledButton variant="ghost" onClick={() => dispatch(logout())}>
                  Logout
                </StyledButton>
              </>
            )}
          </ButtonGroup>

          {/* Mobile Menu Button */}
          <MobileMenuButton onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </MobileMenuButton>
        </NavContent>
      </NavContainer>

      {/* Mobile Menu Overlay */}
      <Overlay $isOpen={mobileMenuOpen} onClick={closeMobileMenu} />

      {/* Mobile Menu */}
      <MobileMenu $isOpen={mobileMenuOpen}>
        <MobileMenuContent>
          {!isAuthenticated ? (
            <>
              <MobileMenuItem>
                <StyledButton
                  variant="ghost"
                  as={RouterLink}
                  to="/signin"
                  onClick={closeMobileMenu}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Sign In
                </StyledButton>
              </MobileMenuItem>
              <MobileMenuItem>
                <StyledButton
                  variant="primary"
                  as={RouterLink}
                  to="/signup"
                  onClick={closeMobileMenu}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Sign Up
                </StyledButton>
              </MobileMenuItem>
            </>
          ) : (
            <>
              <MobileUserGreeting>
                <Typography variant="body1" sx={{ color: '#2D9596', fontWeight: 600 }}>
                  Hi, {user?.fullName?.split(' ')[0]}! 👋
                </Typography>
              </MobileUserGreeting>
              <MobileDivider />
              <MobileMenuItem>
                <StyledButton
                  variant="primary"
                  as={RouterLink}
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Dashboard
                </StyledButton>
              </MobileMenuItem>
              <MobileMenuItem>
                <StyledButton
                  variant="ghost"
                  onClick={() => {
                    dispatch(logout());
                    closeMobileMenu();
                  }}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Logout
                </StyledButton>
              </MobileMenuItem>
            </>
          )}
        </MobileMenuContent>
      </MobileMenu>
    </>
  );
};
