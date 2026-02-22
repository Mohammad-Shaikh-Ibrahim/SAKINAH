import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Stack,
} from '@mui/material';
import {
    LockOutlined as LockIcon,
    Home as HomeIcon,
    ArrowBack as BackIcon,
    BugReport as BugReportIcon,
} from '@mui/icons-material';
import styled from 'styled-components';
import { usePermissions } from '../hooks/usePermissions';
import { ReportIssueModal } from '../../help/components/ReportIssueModal';

const StyledPaper = styled(Paper)`
    padding: 48px;
    text-align: center;
    max-width: 500px;
    margin: 0 auto;
`;

const IconWrapper = styled(Box)`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: ${({ theme }) => theme.palette?.error?.light || '#ffebee'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
`;

const AccessDeniedPage = () => {
    const navigate = useNavigate();
    const { userRole, currentUser } = usePermissions();
    const [reportOpen, setReportOpen] = useState(false);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/dashboard');
    };

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    minHeight: '60vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                }}
            >
                <StyledPaper elevation={3}>
                    <IconWrapper>
                        <LockIcon
                            sx={{
                                fontSize: 48,
                                color: 'error.main',
                            }}
                        />
                    </IconWrapper>

                    <Typography variant="h4" gutterBottom color="error">
                        Access Denied
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        You don't have permission to access this page.
                    </Typography>

                    {currentUser && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 3 }}
                        >
                            You are logged in as{' '}
                            <strong>{currentUser.fullName}</strong> with role{' '}
                            <strong style={{ textTransform: 'capitalize' }}>
                                {userRole}
                            </strong>
                            .
                        </Typography>
                    )}

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        If you believe this is an error, please contact your
                        administrator.
                    </Typography>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        justifyContent="center"
                    >
                        <Button
                            variant="outlined"
                            startIcon={<BackIcon />}
                            onClick={handleGoBack}
                        >
                            Go Back
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<HomeIcon />}
                            onClick={handleGoHome}
                        >
                            Go to Dashboard
                        </Button>
                        <Button
                            variant="outlined"
                            color="warning"
                            startIcon={<BugReportIcon />}
                            onClick={() => setReportOpen(true)}
                        >
                            Report This Issue
                        </Button>
                    </Stack>
                </StyledPaper>
            </Box>

            <ReportIssueModal
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                preselectedType="access_denied"
            />
        </Container>
    );
};

export default AccessDeniedPage;
