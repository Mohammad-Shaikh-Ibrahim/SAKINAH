import styled from 'styled-components';
import { Box, Paper, Chip } from '@mui/material';

export const InfoGrid = styled(Box)`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  width: 100%;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const InfoItem = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  /* Make full width if specified */
  ${props => props.fullWidth && `
    grid-column: 1 / -1;
  `}
`;

export const DetailLabel = styled(Box)`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const DetailValue = styled(Box)`
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 500;
  line-height: 1.5;
`;

export const StatusBadge = styled(Chip)`
  font-weight: 700 !important;
  border-radius: 6px !important;
  text-transform: uppercase !important;
  font-size: 0.75rem !important;
  height: 24px !important;
`;

export const PatientCardWrapper = styled(Paper)`
  padding: 16px;
  background-color: #f8fcfc !important;
  border: 1px solid rgba(45, 149, 150, 0.1) !important;
  border-radius: 12px !important;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: none !important;
`;

export const SectionHeader = styled(Box)`
    grid-column: 1 / -1;
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
    margin-bottom: 8px;
    margin-top: 8px;
    
    &:first-of-type {
        margin-top: 0;
    }
`;
