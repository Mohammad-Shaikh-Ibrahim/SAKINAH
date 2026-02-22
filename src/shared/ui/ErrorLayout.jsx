import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNavigate } from 'react-router-dom';

const ErrorContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  text-align: center;
`;

const IconWrapper = styled(Box)`
  background-color: ${(props) => props.theme.palette.background.default};
  border-radius: 50%;
  padding: 32px;
  margin-bottom: 24px;
  display: inline-flex;
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
  
  svg {
    font-size: 64px;
    color: ${(props) => props.theme.palette.primary.main};
  }
`;

const ErrorTitle = styled(Typography)`
  font-weight: 700 !important;
  margin-bottom: 16px !important;
  color: ${(props) => props.theme.palette.text.primary};
`;

const ErrorMessage = styled(Typography)`
  color: ${(props) => props.theme.palette.text.secondary};
  max-width: 500px;
  margin-bottom: 32px !important;
  line-height: 1.6 !important;
`;

const ActionButtons = styled(Box)`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

export const ErrorLayout = ({
    code,
    title,
    message,
    icon: Icon,
    isServer = false
}) => {
    const navigate = useNavigate();

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <ErrorContainer maxWidth="md">
            <IconWrapper>
                {Icon && <Icon />}
            </IconWrapper>

            <Typography variant="overline" color="primary" fontWeight="bold" letterSpacing={2}>
                Error {code}
            </Typography>

            <ErrorTitle variant="h3" component="h1">
                {title}
            </ErrorTitle>

            <ErrorMessage variant="h6">
                {message}
            </ErrorMessage>

            <ActionButtons>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    size="large"
                >
                    Go Back
                </Button>

                <Button
                    variant="contained"
                    startIcon={<HomeIcon />}
                    onClick={() => navigate('/')}
                    size="large"
                    disableElevation
                >
                    Home
                </Button>

                {isServer && (
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<RefreshIcon />}
                        onClick={handleRefresh}
                        size="large"
                    >
                        Refresh
                    </Button>
                )}

                <Button
                    variant="outlined"
                    startIcon={<HelpOutlineIcon />}
                    onClick={() => navigate('/dashboard/help')}
                    size="large"
                >
                    Get Help
                </Button>
            </ActionButtons>
        </ErrorContainer>
    );
};

ErrorLayout.propTypes = {
    code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    message: PropTypes.string,
    icon: PropTypes.elementType,
    isServer: PropTypes.bool,
};
