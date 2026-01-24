import styled from 'styled-components';
import { Box, Paper } from '@mui/material';

// Main Grid Container: 2 columns on desktop, 1 on mobile
export const FormGrid = styled(Box)`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  width: 100%;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

// Wrapper for individual fields to ensure they take full cell width
export const FormField = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

// Span 2 columns on desktop (for Notes, Address, etc.)
export const FullWidthField = styled(FormField)`
  @media (min-width: 600px) {
    grid-column: span 2;
  }
`;

// Section Card Wrapper
export const FormSection = styled(Paper)`
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 12px;
  border: 1px solid #e0e0e0; // divider color equivalent
  box-shadow: none;
  background-color: #fff;
`;

// Sticky Footer Wrapper
export const FormFooter = styled(Box)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 24px;
  background-color: #fff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  z-index: 1000;
`;
