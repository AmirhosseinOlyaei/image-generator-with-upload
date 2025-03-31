'use client'

import Footer from '@/components/navigation/Footer'
import MainAppBar from '@/components/navigation/MainAppBar'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/navigation'

export default function PrivacyPolicy() {
  const router = useRouter()

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar />

      <Container component='main' sx={{ flexGrow: 1, py: 8 }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ mb: 3 }}
          >
            Back
          </Button>

          <Typography
            variant='h4'
            component='h1'
            gutterBottom
            sx={{ fontWeight: 'bold', color: 'primary.main' }}
          >
            Privacy Policy
          </Typography>

          <Typography variant='subtitle1' color='text.secondary' paragraph>
            Last updated: March 30, 2025
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            1. Introduction
          </Typography>
          <Typography variant='body1' paragraph>
            Ghibli Vision ("we", "our", or "us") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, and share
            your personal information when you use our website and services.
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            2. Information We Collect
          </Typography>
          <Typography variant='body1' paragraph>
            We collect the following types of information:
          </Typography>
          <Typography variant='body1' component='ul' sx={{ pl: 4 }}>
            <li>Account information: email address, name, and password</li>
            <li>Images you upload for transformation</li>
            <li>Usage information: how you interact with our service</li>
            <li>Payment information: processed by our payment providers</li>
            <li>API keys: if you choose to provide them</li>
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            3. How We Use Your Information
          </Typography>
          <Typography variant='body1' paragraph>
            We use your information to:
          </Typography>
          <Typography variant='body1' component='ul' sx={{ pl: 4 }}>
            <li>Provide and improve our services</li>
            <li>Process your image transformations</li>
            <li>Communicate with you about your account</li>
            <li>Process payments and manage subscriptions</li>
            <li>Ensure security and prevent fraud</li>
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            4. How We Store Your Information
          </Typography>
          <Typography variant='body1' paragraph>
            Your account information is stored securely using Supabase
            authentication services. Uploaded images are temporarily stored for
            processing and may be cached for a limited time to improve
            performance. Custom API keys are stored using industry-standard
            encryption.
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            5. Information Sharing
          </Typography>
          <Typography variant='body1' paragraph>
            We share your information with:
          </Typography>
          <Typography variant='body1' component='ul' sx={{ pl: 4 }}>
            <li>
              AI providers (OpenAI, Stability AI, etc.) when processing your
              image transformations
            </li>
            <li>Service providers who help us operate our business</li>
            <li>Legal authorities when required by law</li>
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            6. Your Rights
          </Typography>
          <Typography variant='body1' paragraph>
            Depending on your location, you may have rights to:
          </Typography>
          <Typography variant='body1' component='ul' sx={{ pl: 4 }}>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your information</li>
            <li>Object to certain processing activities</li>
            <li>Export your data</li>
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            7. Cookies and Tracking
          </Typography>
          <Typography variant='body1' paragraph>
            We use cookies and similar technologies to improve your experience,
            understand how you use our service, and personalize content. You can
            manage your cookie preferences through your browser settings.
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            8. Children's Privacy
          </Typography>
          <Typography variant='body1' paragraph>
            Our service is not intended for children under 13. We do not
            knowingly collect information from children under 13. If you are a
            parent and believe we have collected information from your child,
            please contact us.
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            9. Changes to This Policy
          </Typography>
          <Typography variant='body1' paragraph>
            We may update this Privacy Policy from time to time. We will notify
            you of any significant changes by posting the new policy on this
            page and updating the "Last updated" date.
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            10. Contact Us
          </Typography>
          <Typography variant='body1' paragraph>
            If you have any questions or concerns about this Privacy Policy,
            please contact us at privacy@ghiblivision.com.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  )
}
