import styled from 'styled-components';

export const StyledButton = styled.button`
  padding: ${(props) => props.size === 'large' ? '12px 32px' : '8px 24px'};
  font-size: ${(props) => props.size === 'large' ? '1.1rem' : '0.95rem'};
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;

  ${(props) => props.variant === 'primary' ? `
    background-color: #2D9596; // Premium Teal
    color: white;
    box-shadow: 0 4px 14px 0 rgba(45, 149, 150, 0.39);
    &:hover {
      background-color: #267D7E;
      box-shadow: 0 6px 20px rgba(45, 149, 150, 0.23);
      transform: translateY(-2px);
    }
  ` : props.variant === 'secondary' ? `
    background-color: white;
    color: #2D9596;
    border: 1px solid #2D9596;
    &:hover {
      background-color: rgba(45, 149, 150, 0.05);
      transform: translateY(-2px);
    }
  ` : `
    background-color: transparent;
    color: #444;
    &:hover {
      color: #2D9596;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;
