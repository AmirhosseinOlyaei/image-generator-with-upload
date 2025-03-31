'use client'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
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
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function MainAppBar() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<
    React.MouseEvent['currentTarget'] | null
  >(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  // Helper function to safely fetch profile or create it if it doesn't exist
  const safelyFetchProfile = async (userId: string) => {
    try {
      // First check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // If profile doesn't exist, skip creation (we'll let useAuth handle it)
      if (error && error.code === 'PGRST116') {
        // Simply return null without attempting to create a profile here
        return null
      } else if (error) {
        // Log other errors but don't throw
        // eslint-disable-next-line no-console
        console.error('Error fetching profile:', error)
        return null
      }

      return data?.avatar_url || null
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error in profile operation:', err)
      return null
    }
  }

  // Check authentication status directly from Supabase
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        const isLoggedIn = !!data.session
        setIsAuthenticated(isLoggedIn)

        // Get user avatar if authenticated
        if (isLoggedIn && data.session) {
          const avatarUrl = await safelyFetchProfile(data.session.user.id)
          if (avatarUrl) {
            setUserAvatar(avatarUrl)
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error checking auth status:', error)
        setIsAuthenticated(false)
      }
    }

    checkAuthStatus()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true)

        // Get user avatar if available
        if (session) {
          ;(async () => {
            const avatarUrl = await safelyFetchProfile(session.user.id)
            if (avatarUrl) {
              setUserAvatar(avatarUrl)
            }
          })()
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setUserAvatar(null)
      }
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenu = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setIsAuthenticated(false)
      setUserAvatar(null)
      setAnchorEl(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error signing out:', error)
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    handleClose()
    setMobileOpen(false)
  }

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Pricing', path: '/#pricing' },
  ]

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <AutoFixHighIcon sx={{ mr: 1 }} />
        <Typography variant='h6' component='div'>
          Ghibli Vision
        </Typography>
      </Box>
      <Divider />
      <List sx={{ py: 2 }}>
        {navItems.map(item => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component={Link}
              href={item.path}
              sx={{
                textAlign: 'center',
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        {isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation('/dashboard')}
                sx={{
                  textAlign: 'left',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon>
                  <DashboardIcon color='primary' />
                </ListItemIcon>
                <ListItemText primary='Studio' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation('/profile')}
                sx={{
                  textAlign: 'left',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon>
                  <AccountCircleIcon color='primary' />
                </ListItemIcon>
                <ListItemText primary='Profile' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  textAlign: 'left',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon>
                  <LogoutIcon color='error' />
                </ListItemIcon>
                <ListItemText primary='Logout' />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation('/auth/signin')}
                sx={{
                  textAlign: 'left',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon>
                  <LoginIcon color='primary' />
                </ListItemIcon>
                <ListItemText primary='Sign In' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation('/auth/signup')}
                sx={{
                  textAlign: 'left',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon>
                  <PersonAddIcon color='secondary' />
                </ListItemIcon>
                <ListItemText primary='Sign Up' />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar
        position='static'
        color='default'
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Container maxWidth='xl'>
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 70 } }}>
            {/* Mobile menu button */}
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
            <Box
              component={Link}
              href='/'
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  textDecoration: 'none',
                },
              }}
            >
              <AutoFixHighIcon
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  mr: 1,
                  color: 'primary.main',
                  fontSize: 32,
                }}
              />
              <Typography
                variant='h6'
                noWrap
                sx={{
                  mr: 2,
                  fontWeight: 700,
                  color: 'primary.main',
                  textDecoration: 'none',
                  letterSpacing: '.1rem',
                }}
              >
                GHIBLI VISION
              </Typography>
            </Box>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
              {navItems.map(item => (
                <Button
                  key={item.name}
                  component={Link}
                  href={item.path}
                  sx={{
                    mx: 1,
                    color: 'text.primary',
                    position: 'relative',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      width: '0',
                      height: '2px',
                      bottom: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'primary.main',
                      transition: 'width 0.3s',
                    },
                    '&:hover': {
                      backgroundColor: 'transparent',
                      '&:after': {
                        width: '80%',
                      },
                    },
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>

            {/* User menu */}
            <Box
              sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}
            >
              {isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    href='/dashboard'
                    variant='outlined'
                    color='primary'
                    startIcon={<DashboardIcon />}
                    sx={{ mr: 2 }}
                  >
                    Studio
                  </Button>
                  <IconButton
                    onClick={handleMenu}
                    size='large'
                    edge='end'
                    aria-label='account of current user'
                    aria-haspopup='true'
                    color='inherit'
                    sx={{
                      ml: 1,
                      border: '2px solid',
                      borderColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    {userAvatar ? (
                      <Avatar
                        src={userAvatar}
                        alt='User avatar'
                        sx={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <AccountCircleIcon />
                    )}
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
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        minWidth: 180,
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => handleNavigation('/profile')}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <ListItemIcon>
                        <AccountCircleIcon fontSize='small' color='primary' />
                      </ListItemIcon>
                      Profile
                    </MenuItem>
                    <MenuItem
                      onClick={() => handleNavigation('/dashboard')}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <ListItemIcon>
                        <DashboardIcon fontSize='small' color='primary' />
                      </ListItemIcon>
                      Studio
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <ListItemIcon>
                        <LogoutIcon fontSize='small' color='error' />
                      </ListItemIcon>
                      Sign Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    href='/auth/signin'
                    sx={{
                      color: 'text.primary',
                      mr: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                    startIcon={<LoginIcon />}
                  >
                    Sign In
                  </Button>
                  <Button
                    component={Link}
                    href='/auth/signup'
                    variant='contained'
                    color='primary'
                    startIcon={<PersonAddIcon />}
                    sx={{
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                  >
                    Sign Up
                  </Button>
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
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}
