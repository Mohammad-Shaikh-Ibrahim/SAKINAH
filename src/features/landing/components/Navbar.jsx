import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { StyledButton } from '../../../shared/ui/StyledButton';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Typography, IconButton, Avatar, Menu, MenuItem,
    Divider, Box,
} from '@mui/material';
import { selectAuth, logout } from '../../auth/store/authSlice';
import { ROLE_COLORS } from '../../users';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0 24px;
  transition: box-shadow 0.3s ease;
  box-shadow: ${props => props.$scrolled
    ? '0 2px 20px rgba(0,150,136,0.14)'
    : '0 1px 20px rgba(0,150,136,0.06)'};

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
  gap: 10px;
  font-size: 1.4rem;
  font-weight: 800;
  color: #2D9596;
  letter-spacing: 2px;
  cursor: pointer;
  flex-shrink: 0;
  text-decoration: none !important;

  img {
    height: 52px;
    display: block;

    @media (max-width: 768px) {
      height: 44px;
    }
  }

  span {
    @media (max-width: 480px) {
      display: none;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;

  @media (max-width: 768px) { display: none; }
`;

const NavLinkBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  color: #172B4D;
  padding: 6px 14px;
  border-radius: 6px;
  position: relative;
  transition: color 0.2s;
  letter-spacing: 0.01em;

  &::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 60%;
    height: 2px;
    background: #2D9596;
    border-radius: 1px;
    transition: transform 0.25s ease;
  }

  &:hover {
    color: #2D9596;
    &::after { transform: translateX(-50%) scaleX(1); }
  }
`;

const ProfileChipButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px 5px 5px;
  border-radius: 40px;
  font-family: inherit;
  transition: background 0.2s;
  &:hover { background: rgba(45,149,150,0.08); }
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
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const MobileMenu = styled.div`
  display: none;
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(12px);
  padding: 20px 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 999;
  animation: ${slideIn} 0.25s ease;

  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
`;

const MobileMenuContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MobileNavLinkBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  color: #172B4D;
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.15s, color 0.15s;
  &:hover { background: rgba(45,149,150,0.07); color: #2D9596; }
`;

const MobileDivider = styled.div`
  height: 1px;
  background: #e8edf2;
  margin: 4px 0;
`;

const MobileUserGreeting = styled.div`
  text-align: center;
  padding: 12px;
  background: linear-gradient(135deg, rgba(45,149,150,0.08) 0%, rgba(45,149,150,0.04) 100%);
  border-radius: 12px;
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 72px;
  left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 998;
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
  }
`;

function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector(selectAuth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const roleColors = ROLE_COLORS[user?.role] || { bg: '#e0e0e0', color: '#616161' };
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
    : '?';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const handleLogout = () => { setProfileAnchor(null); closeMobileMenu(); dispatch(logout()); };
  const handleNav = (path) => { setProfileAnchor(null); closeMobileMenu(); navigate(path); };

  return (
    <>
      <NavContainer $scrolled={scrolled}>
        <NavContent>
          {/* Logo */}
          <Logo as={RouterLink} to="/" onClick={closeMobileMenu}>
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="SAKINAH Logo" />
            <span>SAKINAH</span>
          </Logo>

          {/* Center nav links */}
          <NavLinks>
            <NavLinkBtn onClick={() => scrollToSection('about')}>About</NavLinkBtn>
            <NavLinkBtn onClick={() => scrollToSection('contact')}>Contact Us</NavLinkBtn>
          </NavLinks>

          {/* Desktop CTAs */}
          <ButtonGroup>
            {!isAuthenticated ? (
              <>
                <StyledButton variant="secondary" as={RouterLink} to="/signin">
                  Sign In
                </StyledButton>
                <StyledButton variant="primary" as={RouterLink} to="/signup">
                  Get Started →
                </StyledButton>
              </>
            ) : (
              <>
                <StyledButton variant="primary" as={RouterLink} to="/dashboard">
                  Go to Dashboard →
                </StyledButton>

                {/* Profile chip */}
                <ProfileChipButton onClick={(e) => setProfileAnchor(e.currentTarget)}>
                  <Avatar sx={{ width: 34, height: 34, bgcolor: '#2D9596', fontSize: '0.8rem', fontWeight: 700 }}>
                    {initials}
                  </Avatar>
                  <Box sx={{ textAlign: 'left', display: { xs: 'none', sm: 'block' } }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#172B4D', display: 'block', lineHeight: 1.2 }}>
                      {user?.fullName?.split(' ').slice(0, 2).join(' ')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: roleColors.color, fontSize: '0.65rem', textTransform: 'capitalize' }}>
                      {user?.role}
                    </Typography>
                  </Box>
                  <KeyboardArrowDownIcon sx={{
                    fontSize: 18,
                    color: '#6B778C',
                    transition: 'transform 0.2s',
                    transform: Boolean(profileAnchor) ? 'rotate(180deg)' : 'none',
                  }} />
                </ProfileChipButton>

                <Menu
                  anchorEl={profileAnchor}
                  open={Boolean(profileAnchor)}
                  onClose={() => setProfileAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{ sx: { mt: 1, minWidth: 220, borderRadius: 2 } }}
                >
                  <Box sx={{ px: 2, py: 1.5, bgcolor: '#F4F7FB', borderBottom: '1px solid #E8EDF2', pointerEvents: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: '#2D9596', fontSize: '0.85rem' }}>{initials}</Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#172B4D', lineHeight: 1.2 }}>{user?.fullName}</Typography>
                        <Typography variant="caption" sx={{ color: '#6B778C' }}>{user?.email}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <MenuItem onClick={() => handleNav('/dashboard/profile')}>
                    <PersonIcon fontSize="small" sx={{ mr: 1.5, color: '#6B778C' }} />My Profile
                  </MenuItem>
                  <MenuItem onClick={() => handleNav('/dashboard/help')}>
                    <HelpOutlineIcon fontSize="small" sx={{ mr: 1.5, color: '#6B778C' }} />Help & Support
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </ButtonGroup>

          {/* Mobile hamburger */}
          <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </MobileMenuButton>
        </NavContent>
      </NavContainer>

      <Overlay $isOpen={mobileMenuOpen} onClick={closeMobileMenu} />

      <MobileMenu $isOpen={mobileMenuOpen}>
        <MobileMenuContent>
          <MobileNavLinkBtn onClick={() => { scrollToSection('about'); closeMobileMenu(); }}>About</MobileNavLinkBtn>
          <MobileNavLinkBtn onClick={() => { scrollToSection('contact'); closeMobileMenu(); }}>Contact Us</MobileNavLinkBtn>
          <MobileDivider />

          {!isAuthenticated ? (
            <>
              <StyledButton variant="secondary" as={RouterLink} to="/signin" onClick={closeMobileMenu} style={{ width: '100%', justifyContent: 'center' }}>
                Sign In
              </StyledButton>
              <StyledButton variant="primary" as={RouterLink} to="/signup" onClick={closeMobileMenu} style={{ width: '100%', justifyContent: 'center' }}>
                Get Started →
              </StyledButton>
            </>
          ) : (
            <>
              <MobileUserGreeting>
                <Typography variant="body2" sx={{ color: '#2D9596', fontWeight: 700 }}>{user?.fullName}</Typography>
                <Typography variant="caption" sx={{ color: '#6B778C', textTransform: 'capitalize' }}>{user?.role}</Typography>
              </MobileUserGreeting>
              <StyledButton variant="primary" as={RouterLink} to="/dashboard" onClick={closeMobileMenu} style={{ width: '100%', justifyContent: 'center' }}>
                Go to Dashboard →
              </StyledButton>
              <StyledButton variant="ghost" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center' }}>
                Logout
              </StyledButton>
            </>
          )}
        </MobileMenuContent>
      </MobileMenu>
    </>
  );
};
