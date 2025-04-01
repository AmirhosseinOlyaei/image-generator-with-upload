'use client'

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function MainAppBar() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleClose = () => {
    setMobileOpen(false)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    handleClose()
  }

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Studio', path: '/dashboard' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Profile', path: '/profile' },
  ]

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          background:
            'linear-gradient(135deg, rgba(165, 204, 217, 0.9) 0%, rgba(213, 180, 209, 0.9) 100%)',
          color: 'white',
        }}
      >
        <AutoFixHighIcon
          sx={{
            mr: 1,
            filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.15))',
            color: 'white',
          }}
        />
        <Typography
          variant='h6'
          component='div'
          sx={{
            fontWeight: 700,
            letterSpacing: '.1rem',
            color: 'white',
            textDecoration: 'none',
            textShadow: '0px 2px 3px rgba(0, 0, 0, 0.15)',
          }}
        >
          GHIBLI AI
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map(item => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              sx={{ textAlign: 'center' }}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <AppBar
      position='static'
      sx={{
        background:
          'linear-gradient(135deg, rgba(165, 204, 217, 0.95) 0%, rgba(213, 180, 209, 0.95) 100%)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          {/* Mobile menu icon */}
          <IconButton
            color='inherit'
            aria-label='open drawer'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo for mobile */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', sm: 'none' },
              alignItems: 'center',
            }}
          >
            <Link
              href='/'
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <AutoFixHighIcon
                sx={{
                  mr: 1,
                  filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.15))',
                  color: 'white',
                }}
              />
              <Typography
                variant='h6'
                component='div'
                sx={{
                  fontWeight: 700,
                  letterSpacing: '.1rem',
                  color: 'white',
                  textDecoration: 'none',
                  textShadow: '0px 2px 3px rgba(0, 0, 0, 0.15)',
                }}
              >
                GHIBLI AI
              </Typography>
            </Link>
          </Box>

          {/* Logo for desktop */}
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              mr: 4,
            }}
          >
            <Link
              href='/'
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <AutoFixHighIcon
                sx={{
                  mr: 1,
                  filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.15))',
                  color: 'white',
                  fontSize: '2rem',
                }}
              />
              <Typography
                variant='h5'
                component='div'
                sx={{
                  fontWeight: 700,
                  letterSpacing: '.2rem',
                  color: 'white',
                  textDecoration: 'none',
                  textShadow: '0px 2px 3px rgba(0, 0, 0, 0.15)',
                }}
              >
                GHIBLI AI
              </Typography>
            </Link>
          </Box>

          {/* Desktop navigation */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
            {navItems.map(item => (
              <Button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  my: 2,
                  color: 'white',
                  display: 'block',
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>

          {/* Mobile drawer */}
          <Drawer
            variant='temporary'
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 240,
              },
            }}
          >
            {drawer}
          </Drawer>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
