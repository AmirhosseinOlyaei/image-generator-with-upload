'use client';

import { Box, Container, Typography, Grid, Paper, Step, StepLabel, Stepper, StepContent } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DownloadIcon from '@mui/icons-material/Download';

const steps = [
  {
    label: 'Upload Your Photo',
    description: 'Start by uploading any personal photo. The best results come from clear images with good lighting.',
    icon: <FileUploadIcon fontSize="large" color="primary" />,
  },
  {
    label: 'Choose Your AI Provider',
    description: 'Select from top AI providers specializing in Ghibli-style transformations for the best results.',
    icon: <AutoFixHighIcon fontSize="large" color="primary" />,
  },
  {
    label: 'Get Your Ghibli Masterpiece',
    description: 'Within seconds, receive your transformed image rendered in the beautiful Studio Ghibli style.',
    icon: <DownloadIcon fontSize="large" color="primary" />,
  },
];

export default function HowItWorks() {
  return (
    <Box sx={{ py: 10 }} id="how-it-works">
      <Container maxWidth="lg">
        <Typography 
          variant="h2" 
          component="h2" 
          align="center"
          sx={{ 
            mb: 2,
            color: 'primary.dark',
            fontWeight: 'bold'
          }}
        >
          How It Works
        </Typography>
        
        <Typography 
          variant="h5" 
          component="p" 
          align="center"
          sx={{ 
            mb: 8,
            color: 'text.secondary',
            maxWidth: 800,
            mx: 'auto'
          }}
        >
          Transform your photos into Ghibli-style artwork in just three simple steps
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={10} lg={8}>
            <Stepper orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label} active={true}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Paper
                        elevation={4}
                        sx={{
                          width: 60,
                          height: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          backgroundColor: 'primary.light',
                          color: 'white',
                        }}
                      >
                        {step.icon}
                      </Paper>
                    )}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body1" sx={{ py: 2, color: 'text.secondary', fontSize: '1.1rem' }}>
                      {step.description}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mx: 'auto',
              maxWidth: 700,
              borderRadius: 2,
              backgroundColor: 'rgba(77, 124, 138, 0.08)',
              border: '1px solid rgba(77, 124, 138, 0.2)',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.dark', fontWeight: 'bold' }}>
              Free Trial for Everyone
            </Typography>
            <Typography variant="body1">
              Every new account gets one free image transformation. After that, you can provide your own API key
              or subscribe to one of our affordable plans for unlimited transformations.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}
