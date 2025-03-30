'use client';

import { Box, Container, Typography, Paper, Divider, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import MainAppBar from '@/components/navigation/MainAppBar';
import Footer from '@/components/navigation/Footer';

export default function TermsOfService() {
  const router = useRouter();
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar user={null} loading={false} />
      
      <Container component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.back()}
            sx={{ mb: 3 }}
          >
            Back
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Terms of Service
          </Typography>
          
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Last updated: March 30, 2025
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to Ghibli Vision. These Terms of Service govern your use of our website and services. By accessing or using Ghibli Vision, you agree to be bound by these Terms.
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            2. Definitions
          </Typography>
          <Typography variant="body1" paragraph>
            "Service" refers to the Ghibli Vision application.
            "User" refers to anyone who uses the Service.
            "Generated Content" refers to the images created by our AI technology based on User uploads.
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            3. Account Registration
          </Typography>
          <Typography variant="body1" paragraph>
            You may need to create an account to use some features of our Service. You are responsible for maintaining the confidentiality of your account information and for all activities under your account.
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            4. Free and Paid Services
          </Typography>
          <Typography variant="body1" paragraph>
            Ghibli Vision offers both free and paid subscription options. Free accounts are limited to one image transformation. Subscription details and pricing are available on our pricing page.
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            5. User Content
          </Typography>
          <Typography variant="body1" paragraph>
            You retain ownership of images you upload to our Service. By uploading content, you grant us a license to use, modify, and store that content for the purpose of providing our Service.
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            6. Generated Content
          </Typography>
          <Typography variant="body1" paragraph>
            The ownership and usage rights of AI-generated images depend on your subscription tier. Basic and Premium users receive a license for personal use only, while Ultimate tier subscribers receive commercial usage rights.
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            7. API Integration
          </Typography>
          <Typography variant="body1" paragraph>
            Users may provide their own API keys for various AI providers. We do not store these keys in plain text and use them solely for the purpose of generating images as requested by the user.
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            8. Prohibited Content
          </Typography>
          <Typography variant="body1" paragraph>
            You may not use our Service to generate content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable. We reserve the right to remove any content that violates these terms.
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            9. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            We may terminate or suspend your account at any time for any reason, including violation of these Terms. Upon termination, your right to use the Service will immediately cease.
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            10. Changes to Terms
          </Typography>
          <Typography variant="body1" paragraph>
            We may update these Terms from time to time. We will notify users of any significant changes. Your continued use of the Service after changes constitutes acceptance of the new Terms.
          </Typography>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
            11. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms, please contact us at support@ghiblivision.com.
          </Typography>
        </Paper>
      </Container>
      
      <Footer />
    </Box>
  );
}
