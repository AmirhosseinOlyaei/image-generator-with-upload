'use client'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material'
import Image from 'next/image'

interface HeroSectionProps {
  onGetStarted: () => void
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <Box
      sx={{
        backgroundImage:
          'linear-gradient(135deg, rgba(77, 124, 138, 0.9) 0%, rgba(107, 154, 168, 0.8) 100%)',
        pt: { xs: 10, md: 15 },
        pb: { xs: 12, md: 18 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative elements that mimic Ghibli's nature aesthetic */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          zIndex: 0,
          opacity: 0.1,
          height: '100%',
          width: '100%',
          backgroundImage: `url('https://images.unsplash.com/photo-1597231350111-12396eec5408?q=80&w=300&auto=format&fit=crop')`,
          backgroundSize: 'cover',
        }}
      />

      <Container maxWidth='xl'>
        <Grid
          container
          spacing={4}
          alignItems='center'
          justifyContent='space-between'
        >
          <Grid item xs={12} md={6} sx={{ zIndex: 1 }}>
            <Typography
              variant='h1'
              component='h1'
              sx={{
                color: '#ffffff',
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '0px 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              Transform Your Photos into Ghibli Masterpieces
            </Typography>

            <Typography
              variant='h5'
              sx={{
                color: '#ffffff',
                mb: 4,
                maxWidth: '600px',
                textShadow: '0px 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              Experience the magic of Studio Ghibli as AI transforms your
              ordinary photos into extraordinary animated artwork
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant='contained'
                color='secondary'
                size='large'
                startIcon={<CloudUploadIcon />}
                onClick={onGetStarted}
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  boxShadow: '0px 8px 16px rgba(0,0,0,0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0px 10px 20px rgba(0,0,0,0.25)',
                  },
                }}
              >
                Try It Now
              </Button>

              <Button
                variant='outlined'
                size='large'
                sx={{
                  py: 1.5,
                  px: 4,
                  fontSize: '1.1rem',
                  color: '#ffffff',
                  borderColor: '#ffffff',
                  '&:hover': {
                    borderColor: '#ffffff',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
                href='#how-it-works'
              >
                Learn More
              </Button>
            </Box>
          </Grid>

          <Grid
            item
            xs={12}
            md={5}
            sx={{ zIndex: 1, display: { xs: 'none', md: 'block' } }}
          >
            <Paper
              elevation={12}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                transform: 'rotate(2deg)',
                position: 'relative',
                height: 450,
                width: '100%',
                boxShadow: '0px 16px 32px rgba(0,0,0,0.2)',
              }}
            >
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* This will be replaced with actual image but is a placeholder for now */}
                <Image
                  src='https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800&auto=format&fit=crop'
                  alt='Photo transformation to Ghibli style'
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
