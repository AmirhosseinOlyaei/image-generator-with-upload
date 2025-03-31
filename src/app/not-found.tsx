'use client'

import Footer from '@/components/navigation/Footer'
import MainAppBar from '@/components/navigation/MainAppBar'
import { Box, Button, Container, Paper, Typography } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar />

      <Container
        component='main'
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 5,
            borderRadius: 2,
            textAlign: 'center',
            maxWidth: 600,
          }}
        >
          <Typography
            variant='h2'
            component='h1'
            sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}
          >
            404
          </Typography>

          <Typography
            variant='h4'
            component='h2'
            sx={{ mb: 4, fontWeight: 'medium' }}
          >
            Page Not Found
          </Typography>

          <Box sx={{ position: 'relative', height: 250, width: '100%', my: 4 }}>
            <Image
              src='/images/notfound-ghibli.jpg'
              alt='Ghibli character looking confused'
              fill
              style={{ objectFit: 'contain' }}
            />
          </Box>

          <Typography variant='body1' sx={{ mb: 4 }}>
            Sorry, the page you're looking for has wandered off into a Ghibli
            adventure. Let's get you back to a world we know.
          </Typography>

          <Button
            variant='contained'
            color='primary'
            size='large'
            onClick={() => router.push('/')}
            sx={{ px: 4, py: 1.5 }}
          >
            Return Home
          </Button>
        </Paper>
      </Container>

      <Footer />
    </Box>
  )
}
