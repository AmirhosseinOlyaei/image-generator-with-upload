'use client'

import { supabase } from '@/lib/supabase'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Avatar,
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
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface MainAppBarProps {
  user: any
  loading: boolean
}

export default function MainAppBar({ user, loading }: MainAppBarProps) {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setAnchorEl(null)
    router.push('/')
    router.refresh()
  }

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#how-it-works' },
    { name: 'Pricing', path: '/pricing' },
  ]

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography
        variant='h6'
        sx={{ my: 2, fontWeight: 'bold', color: 'primary.main' }}
      >
        Ghibli Vision
      </Typography>
      <Divider />
      <List>
        {navItems.map(item => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              sx={{ textAlign: 'center' }}
              component={Link}
              href={item.path}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
        {!loading && !user && (
          <>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ textAlign: 'center' }}
                component={Link}
                href='/auth/signin'
              >
                <ListItemText primary='Sign In' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                sx={{
                  textAlign: 'center',
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
                component={Link}
                href='/auth/signup'
              >
                <ListItemText primary='Sign Up' />
              </ListItemButton>
            </ListItem>
          </>
        )}
        {!loading && user && (
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                textAlign: 'center',
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
              component={Link}
              href='/dashboard'
            >
              <ListItemText primary='Dashboard' />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar
        position='fixed'
        color='default'
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
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

            {/* Logo */}
            <Typography
              variant='h6'
              component={Link}
              href='/'
              sx={{
                mr: 2,
                fontWeight: 700,
                color: 'primary.main',
                textDecoration: 'none',
                flexGrow: { xs: 1, sm: 0 },
              }}
            >
              Ghibli Vision
            </Typography>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
              {navItems.map(item => (
                <Button
                  key={item.name}
                  component={Link}
                  href={item.path}
                  sx={{ color: 'text.primary', mx: 1 }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>

            {/* Auth buttons or user menu */}
            <Box
              sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}
            >
              {!loading && !user && (
                <>
                  <Button
                    component={Link}
                    href='/auth/signin'
                    sx={{ color: 'text.primary', mr: 1 }}
                  >
                    Sign In
                  </Button>
                  <Button
                    component={Link}
                    href='/auth/signup'
                    variant='contained'
                    color='primary'
                  >
                    Sign Up
                  </Button>
                </>
              )}

              {!loading && user && (
                <>
                  <Button
                    component={Link}
                    href='/dashboard'
                    color='primary'
                    sx={{ mr: 2 }}
                  >
                    Dashboard
                  </Button>

                  <IconButton
                    onClick={handleMenu}
                    size='small'
                    edge='end'
                    aria-label='account of current user'
                    aria-haspopup='true'
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'primary.main',
                        border: '2px solid',
                        borderColor: 'primary.light',
                      }}
                    >
                      {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  </IconButton>
                  <Menu
                    id='menu-appbar'
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem
                      component={Link}
                      href='/profile'
                      onClick={handleClose}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      href='/dashboard'
                      onClick={handleClose}
                    >
                      Dashboard
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Toolbar placeholder to prevent content from hiding behind app bar */}
      <Toolbar />
    </>
  )
}
