'use client'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Roboto } from 'next/font/google'
import * as React from 'react'

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

// Create a custom theme inspired by Studio Ghibli's color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#4D7C8A', // Teal/blue - water color from many Ghibli films
      light: '#7AA0AA',
      dark: '#2D5C6A',
      contrastText: '#fff',
    },
    secondary: {
      main: '#F7B538', // Warm yellow/gold - sunset colors in Ghibli films
      light: '#FFCE69',
      dark: '#D59500',
      contrastText: '#000',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    error: {
      main: '#D64933', // Warm red - for errors
    },
    success: {
      main: '#7FB069', // Soft green - nature colors from Ghibli films
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          padding: '8px 24px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
})

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
