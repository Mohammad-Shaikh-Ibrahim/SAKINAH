import styled from 'styled-components';
import { Box } from '@mui/material';

export const FormGrid = styled(Box)`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;

  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const FormFieldWrapper = styled(Box)`
  grid-column: span 1;
  
  /* Handle full-width fields */
  ${props => props.fullWidth && `
    grid-column: 1 / -1;
  `}

  /* Ensure consistent height for standard inputs */
  .MuiInputBase-root {
    min-height: 56px; /* Standard MUI height */
    border-radius: 8px; /* Consistent border radius */
  }

  /* Consistent label styling */
  .MuiInputLabel-root {
    font-size: 0.95rem;
  }
`;

export const ModalContentWrapper = styled(Box)`
  padding-top: 8px;
  
  /* Ensure no overflow issues */
  overflow-x: hidden;
  width: 100%;
`;
