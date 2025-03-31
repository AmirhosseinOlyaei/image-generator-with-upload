'use client'

import FacebookIcon from '@mui/icons-material/Facebook'
import GitHubIcon from '@mui/icons-material/GitHub'
import InstagramIcon from '@mui/icons-material/Instagram'
import TwitterIcon from '@mui/icons-material/Twitter'
import {
  Box,
  Container,
  Divider,
  Grid,
  IconButton,
  Link,
  Typography,
} from '@mui/material'

export default function Footer() {
  return (
    <Box
      component='footer'
      sx={{
        py: 6,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth='lg'>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography
              variant='h6'
              color='primary.main'
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Ghibli Vision
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
              Transform your photos into stunning Studio Ghibli-style artwork
              using the power of AI.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size='small' aria-label='facebook' color='primary'>
                <FacebookIcon fontSize='small' />
              </IconButton>
              <IconButton size='small' aria-label='twitter' color='primary'>
                <TwitterIcon fontSize='small' />
              </IconButton>
              <IconButton size='small' aria-label='instagram' color='primary'>
                <InstagramIcon fontSize='small' />
              </IconButton>
              <IconButton size='small' aria-label='github' color='primary'>
                <GitHubIcon fontSize='small' />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant='h6' color='text.primary' gutterBottom>
              Quick Links
            </Typography>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <Link
                  href='/'
                  color='inherit'
                  underline='hover'
                  sx={{ display: 'inline-block', py: 0.5 }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href='/pricing'
                  color='inherit'
                  underline='hover'
                  sx={{ display: 'inline-block', py: 0.5 }}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href='#how-it-works'
                  color='inherit'
                  underline='hover'
                  sx={{ display: 'inline-block', py: 0.5 }}
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href='/dashboard'
                  color='inherit'
                  underline='hover'
                  sx={{ display: 'inline-block', py: 0.5 }}
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant='h6' color='text.primary' gutterBottom>
              Legal
            </Typography>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <Link
                  href='/terms'
                  color='inherit'
                  underline='hover'
                  sx={{ display: 'inline-block', py: 0.5 }}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href='/privacy'
                  color='inherit'
                  underline='hover'
                  sx={{ display: 'inline-block', py: 0.5 }}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href='/cookies'
                  color='inherit'
                  underline='hover'
                  sx={{ display: 'inline-block', py: 0.5 }}
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant='body2' color='text.secondary' align='center'>
          {'© '}
          {new Date().getFullYear()}
          {' Ghibli Vision. All rights reserved.'}
        </Typography>
      </Container>
    </Box>
  )
}
