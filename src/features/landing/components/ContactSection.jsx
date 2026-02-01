import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  Box,
  Typography,
  Container,
  TextField,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import { StyledButton } from '../../../shared/ui/StyledButton';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(2deg); }
`;

const SectionWrapper = styled.section`
  padding: 120px 0;
  background: linear-gradient(180deg, #ffffff 0%, #f0f7f7 100%);
  position: relative;
  overflow: hidden;
`;

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.4;
  background-image:
    radial-gradient(circle at 20% 80%, rgba(45, 149, 150, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(26, 62, 114, 0.08) 0%, transparent 50%);
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 48px;
  position: relative;
  z-index: 1;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const ContactInfoCard = styled(Box)`
  background: linear-gradient(145deg, #1a3e72 0%, #0d2240 100%);
  border-radius: 32px;
  padding: 48px;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(45, 149, 150, 0.3) 0%, transparent 70%);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -30%;
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, rgba(45, 149, 150, 0.2) 0%, transparent 70%);
  }
`;

const CardContent = styled.div`
  position: relative;
  z-index: 1;
`;

const ContactItem = styled(Box)`
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
  padding: 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(8px);
  }

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const IconBox = styled(Box)`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2D9596 0%, #4DB6AC 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(45, 149, 150, 0.4);

  svg {
    font-size: 24px;
    color: white;
  }
`;

const SocialLinks = styled(Box)`
  display: flex;
  gap: 12px;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const SocialButton = styled(IconButton)`
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  width: 44px;
  height: 44px;
  transition: all 0.3s ease !important;

  &:hover {
    background: #2D9596 !important;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(45, 149, 150, 0.4);
  }
`;

const FormCard = styled(Box)`
  background: white;
  border-radius: 32px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  position: relative;
  border: 1px solid rgba(45, 149, 150, 0.1);
`;

const FormHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 36px;
`;

const FormIconWrapper = styled(Box)`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(45, 149, 150, 0.15) 0%, rgba(45, 149, 150, 0.05) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${float} 3s ease-in-out infinite;

  svg {
    font-size: 28px;
    color: #2D9596;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    background: #f8fbfb;
    border-radius: 14px;
    transition: all 0.3s ease;

    &:hover {
      background: #f0f7f7;
    }

    &:hover fieldset {
      border-color: #2D9596;
    }

    &.Mui-focused {
      background: white;

      fieldset {
        border-color: #2D9596;
        border-width: 2px;
      }
    }
  }

  & .MuiInputLabel-root {
    color: #666;

    &.Mui-focused {
      color: #2D9596;
    }
  }

  & .MuiOutlinedInput-input {
    padding: 16px 20px;
  }
`;

const SubmitButton = styled(StyledButton)`
  width: 100%;
  padding: 18px 32px !important;
  font-size: 1.05rem !important;
  border-radius: 14px !important;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease !important;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(45, 149, 150, 0.4);
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(45, 149, 150, 0.15) 0%, rgba(45, 149, 150, 0.08) 100%);
  color: #2D9596;
  padding: 10px 24px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 2px;
  margin-bottom: 24px;
  border: 1px solid rgba(45, 149, 150, 0.2);
`;

const contactInfo = [
  {
    icon: <LocationOnIcon />,
    title: 'Our Location',
    details: ['123 Health Avenue', 'Medical District, City 12345']
  },
  {
    icon: <EmailIcon />,
    title: 'Email Us',
    details: ['support@sakinah.health', 'info@sakinah.health']
  },
  {
    icon: <PhoneIcon />,
    title: 'Call Us',
    details: ['+1 (555) 123-4567', '+1 (555) 987-6543']
  },
  {
    icon: <AccessTimeIcon />,
    title: 'Working Hours',
    details: ['Mon - Fri: 8:00 AM - 6:00 PM', 'Sat: 9:00 AM - 2:00 PM']
  }
];

export const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSnackbar({
      open: true,
      message: 'Thank you! Your message has been sent successfully.',
      severity: 'success'
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <SectionWrapper id="contact">
      <BackgroundPattern />

      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8, position: 'relative', zIndex: 1 }}>
          <Badge>
            <ChatIcon sx={{ fontSize: 18 }} />
            GET IN TOUCH
          </Badge>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: '#1a3e72',
              mb: 3,
              fontSize: { xs: '2rem', md: '3rem' },
              lineHeight: 1.2
            }}
          >
            Let's Start a
            <Box component="span" sx={{ color: '#2D9596', display: 'block' }}>
              Conversation
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.8
            }}
          >
            Have questions about SAKINAH? We'd love to hear from you.
            Send us a message and we'll respond as soon as possible.
          </Typography>
        </Box>

        <ContentWrapper>
          {/* Contact Info Card */}
          <ContactInfoCard>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>
                Contact Information
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 4, lineHeight: 1.8 }}>
                Fill out the form and our team will get back to you within 24 hours.
              </Typography>

              {contactInfo.map((item, index) => (
                <ContactItem key={index}>
                  <IconBox>
                    {item.icon}
                  </IconBox>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    {item.details.map((detail, idx) => (
                      <Typography key={idx} variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                        {detail}
                      </Typography>
                    ))}
                  </Box>
                </ContactItem>
              ))}

              <SocialLinks>
                <SocialButton size="small">
                  <FacebookIcon fontSize="small" />
                </SocialButton>
                <SocialButton size="small">
                  <TwitterIcon fontSize="small" />
                </SocialButton>
                <SocialButton size="small">
                  <LinkedInIcon fontSize="small" />
                </SocialButton>
                <SocialButton size="small">
                  <InstagramIcon fontSize="small" />
                </SocialButton>
              </SocialLinks>
            </CardContent>
          </ContactInfoCard>

          {/* Contact Form */}
          <FormCard>
            <FormHeader>
              <FormIconWrapper>
                <SendIcon />
              </FormIconWrapper>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a3e72' }}>
                  Send us a Message
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  We'll respond within 24 hours
                </Typography>
              </Box>
            </FormHeader>

            <form onSubmit={handleSubmit}>
              <FormGrid>
                <StyledTextField
                  fullWidth
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <StyledTextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </FormGrid>

              <Box sx={{ mt: 2.5 }}>
                <StyledTextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </Box>

              <Box sx={{ mt: 2.5 }}>
                <StyledTextField
                  fullWidth
                  label="Your Message"
                  name="message"
                  multiline
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us how we can help you..."
                />
              </Box>

              <SubmitButton type="submit" variant="primary">
                Send Message
                <SendIcon sx={{ fontSize: 20 }} />
              </SubmitButton>
            </form>
          </FormCard>
        </ContentWrapper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SectionWrapper>
  );
};
