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

// Mock implementation of Supabase
const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: async (
      callback: (event: string, session: Record<string, unknown>) => void,
    ) => {
      callback('SIGNED_IN', { user: { id: 'mock-user-id' } })
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
    signOut: async () => {},
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
  }),
}

export default function MainAppBar() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [_anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  // TEMPORARILY DISABLED AUTH: Set isAuthenticated to false by default
  const [_isAuthenticated, setIsAuthenticated] = useState(false)
  const [_userAvatar, setUserAvatar] = useState<string | null>(null)

  // TEMPORARILY DISABLED AUTH: Comment out authentication check
  // useEffect(() => {
  //   const safelyFetchProfile = async (userId: string) => {
  //     try {
  //       const { data, error } = await supabase
  //         .from('profiles')
  //         .select('*')
  //         .eq('id', userId)
  //         .single()

  //       if (error) {
  //         throw error
  //       }

  //       if (data) {
  //         return data
  //       }

  //       const { data: createdData, error: createError } = await supabase
  //         .from('profiles')
  //         .insert([{ id: userId, credits: 0, plan: 'free' }])
  //         .select()
  //         .single()

  //       if (createError) {
  //         throw createError
  //       }

  //       return createdData
  //     } catch (error) {
  //       return null
  //     }
  //   }

  //   const checkAuthStatus = async () => {
  //     try {
  //       const { data, error } = await supabase.auth.getSession()

  //       if (error) {
  //         throw error
  //       }

  //       const isLoggedIn = !!data.session
  //       setIsAuthenticated(isLoggedIn)

  //       // Get user avatar if authenticated
  //       if (isLoggedIn && data.session) {
  //         const avatarUrl = await safelyFetchProfile(data.session.user.id)
  //         if (avatarUrl) {
  //           setUserAvatar(avatarUrl.avatar_url || null)
  //         }
  //       }
  //     } catch (error) {
  //       // eslint-disable-next-line no-console
  //       console.error('Error checking auth status:', error)
  //       setIsAuthenticated(false)
  //     }
  //   }

  //   checkAuthStatus()

  //   // Set up auth state listener
  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange(async (event, session) => {
  //     if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
  //       setIsAuthenticated(true)

  //       if (session?.user) {
  //         const profile = await safelyFetchProfile(session.user.id)
  //         if (profile) {
  //           setUserAvatar(profile.avatar_url || null)
  //         }
  //       }
  //     } else if (event === 'SIGNED_OUT') {
  //       setIsAuthenticated(false)
  //       setUserAvatar(null)
  //     }
  //   })

  //   return () => {
  //     subscription.unsubscribe()
  //   }
  // }, [supabase])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const _handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const _handleLogout = async () => {
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

  const _handleNavigation = (path: string) => {
    router.push(path)
    handleClose()
    setMobileOpen(false)
  }

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Studio', path: '/dashboard' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Pricing', path: '/pricing' },
    // TEMPORARILY DISABLED AUTH: Always show dashboard link
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
            textShadow: '0px 2px 3px rgba(0, 0, 0, 0.2)',
          }}
        >
          Ghibli Vision
        </Typography>
      </Box>
      <Divider
        sx={{
          opacity: 0.6,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(188, 203, 214, 0.5) 50%, transparent 100%)',
          height: '1px',
        }}
      />
      <List sx={{ py: 2, background: 'rgba(245, 247, 250, 0.95)' }}>
        {navItems.map(item => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component={Link}
              href={item.path}
              sx={{
                textAlign: 'center',
                py: 1.5,
                color: '#5c7b97',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(122, 181, 209, 0.1)',
                  color: '#7b67aa',
                },
              }}
            >
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  style: {
                    transition: 'all 0.2s ease',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider
          sx={{
            my: 1,
            opacity: 0.6,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(188, 203, 214, 0.5) 50%, transparent 100%)',
            height: '1px',
          }}
        />
      </List>
    </Box>
  )

  return (
    <>
      <AppBar
        position='static'
        elevation={0}
        sx={{
          background:
            'linear-gradient(90deg, rgba(235,245,250,1) 0%, rgba(244,237,245,1) 50%, rgba(235,245,250,1) 100%)',
          borderBottom: '1px solid',
          borderColor: 'rgba(190, 210, 230, 0.3)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background:
              'linear-gradient(90deg, #7ab5d1 0%, #db9dcb 33%, #a6d8e2 66%, #7ab5d1 100%)',
            opacity: 0.8,
          },
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
              sx={{
                mr: 2,
                display: { sm: 'none' },
                color: '#5c7b97',
                '&:hover': {
                  backgroundColor: 'rgba(122, 181, 209, 0.1)',
                },
              }}
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
                position: 'relative',
                '&:hover': {
                  textDecoration: 'none',
                  '& svg': {
                    transform: 'rotate(12deg) scale(1.05)',
                  },
                },
              }}
            >
              <AutoFixHighIcon
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  mr: 1,
                  color: '#7b67aa',
                  fontSize: 32,
                  filter: 'drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.15))',
                  transition: 'transform 0.3s ease-in-out',
                }}
              />
              <Typography
                variant='h6'
                noWrap
                sx={{
                  mr: 2,
                  fontWeight: 700,
                  backgroundImage: 'linear-gradient(45deg, #7ab5d1, #db9dcb)',
                  backgroundSize: '100%',
                  backgroundRepeat: 'repeat',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  MozBackgroundClip: 'text',
                  MozTextFillColor: 'transparent',
                  textDecoration: 'none',
                  letterSpacing: '.1rem',
                  position: 'relative',
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
                    color: '#5c7b97',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: '50%',
                      bottom: 0,
                      width: '0%',
                      height: '2px',
                      background:
                        'linear-gradient(90deg, #8fb8d8 0%, #db9dcb 100%)',
                      transition: 'all 0.3s ease',
                      transform: 'translateX(-50%)',
                      opacity: 0,
                    },
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#7b67aa',
                      '&::before': {
                        width: '80%',
                        opacity: 1,
                      },
                    },
                    '&:active': {
                      transform: 'scale(0.98)',
                    },
                  }}
                >
                  {item.name}
                </Button>
              ))}
            </Box>

            {/* TEMPORARILY DISABLED AUTH: Comment out user menu */}
            {/* User menu */}
            {/* <Box
              sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}
            >
              {isAuthenticated ? (
                <>
                  <Button
                    component={Link}
                    href="/dashboard"
                    variant="outlined"
                    color="primary"
                    startIcon={<DashboardIcon />}
                    sx={{ mr: 2 }}
                  >
                    Studio
                  </Button>
                  <IconButton
                    onClick={handleMenu}
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-haspopup="true"
                    color="inherit"
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
                        alt="User avatar"
                        sx={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <AccountCircleIcon />
                    )}
                  </IconButton>
                  <Menu
                    id="menu-appbar"
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
                        <AccountCircleIcon fontSize="small" color="primary" />
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
                        <DashboardIcon fontSize="small" color="primary" />
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
                        <LogoutIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      Sign Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    href="/auth/signin"
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
                    href="/auth/signup"
                    variant="contained"
                    color="primary"
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
            </Box> */}
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
