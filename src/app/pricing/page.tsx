'use client'

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material'
import { Check, Close } from '@mui/icons-material'
import { useState } from 'react'
import MainAppBar from '@/components/navigation/MainAppBar'
import Footer from '@/components/navigation/Footer'
import { useRouter } from 'next/navigation'

// Mock plans data
const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Basic features for personal use',
    features: [
      { name: '10 image generations per month', included: true },
      { name: 'Basic image resolution (512x512)', included: true },
      { name: 'Standard processing speed', included: true },
      { name: 'Access to basic styles', included: true },
      { name: 'Community support', included: true },
      { name: 'Advanced styles', included: false },
      { name: 'Priority processing', included: false },
      { name: 'API access', included: false },
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outlined',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    description: 'Premium features for professionals',
    features: [
      { name: '100 image generations per month', included: true },
      { name: 'High resolution images (1024x1024)', included: true },
      { name: 'Fast processing speed', included: true },
      { name: 'Access to all styles', included: true },
      { name: 'Priority support', included: true },
      { name: 'Advanced editing tools', included: true },
      { name: 'Priority processing', included: true },
      { name: 'API access', included: false },
    ],
    buttonText: 'Subscribe',
    buttonVariant: 'contained',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    description: 'Advanced features for teams',
    features: [
      { name: 'Unlimited image generations', included: true },
      { name: 'Maximum resolution images (2048x2048)', included: true },
      { name: 'Fastest processing speed', included: true },
      { name: 'Access to all styles and beta features', included: true },
      { name: 'Dedicated support', included: true },
      { name: 'Advanced editing and batch processing', included: true },
      { name: 'Highest priority processing', included: true },
      { name: 'Full API access with higher rate limits', included: true },
    ],
    buttonText: 'Contact Us',
    buttonVariant: 'contained',
    popular: false,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    setLoading(true)

    // Simulate a brief loading state before redirecting
    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar />

      <Container
        component='main'
        maxWidth='lg'
        sx={{ mt: 8, mb: 8, flexGrow: 1 }}
      >
        <Box textAlign='center' mb={6}>
          <Typography
            component='h1'
            variant='h2'
            color='text.primary'
            gutterBottom
            fontWeight='bold'
          >
            Choose Your Plan
          </Typography>
          <Typography variant='h5' color='text.secondary' component='p'>
            Select the perfect plan for your creative needs
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems='stretch'>
          {plans.map(plan => (
            <Grid item key={plan.id} xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  boxShadow: plan.popular
                    ? '0 8px 24px rgba(0, 0, 0, 0.15)'
                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: plan.popular ? 2 : 0,
                  borderColor: 'primary.main',
                  position: 'relative',
                  overflow: 'visible',
                }}
              >
                {plan.popular && (
                  <Paper
                    sx={{
                      position: 'absolute',
                      top: -15,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      py: 1,
                      px: 3,
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: 5,
                      fontWeight: 'bold',
                      zIndex: 1,
                    }}
                  >
                    <Typography variant='body2' fontWeight='bold'>
                      MOST POPULAR
                    </Typography>
                  </Paper>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant='h4'
                    component='h2'
                    fontWeight='bold'
                    color={plan.popular ? 'primary.main' : 'text.primary'}
                  >
                    {plan.name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      mb: 2,
                    }}
                  >
                    <Typography
                      component='span'
                      variant='h3'
                      color='text.primary'
                      fontWeight='bold'
                    >
                      ${plan.price}
                    </Typography>
                    {plan.price > 0 && (
                      <Typography
                        component='span'
                        variant='h6'
                        color='text.secondary'
                        sx={{ ml: 1 }}
                      >
                        /month
                      </Typography>
                    )}
                  </Box>
                  <Typography color='text.secondary' sx={{ mb: 3 }}>
                    {plan.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List sx={{ mb: 2 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {feature.included ? (
                            <Check color='primary' />
                          ) : (
                            <Close color='disabled' />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={feature.name}
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: feature.included ? 'medium' : 'regular',
                            color: feature.included
                              ? 'text.primary'
                              : 'text.secondary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={plan.buttonVariant as 'outlined' | 'contained'}
                    color='primary'
                    size='large'
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading && selectedPlan === plan.id}
                    sx={{
                      py: 1.5,
                      fontWeight: 'bold',
                      borderRadius: 2,
                      boxShadow:
                        plan.buttonVariant === 'contained'
                          ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                          : 'none',
                    }}
                  >
                    {loading && selectedPlan === plan.id
                      ? 'Processing...'
                      : plan.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant='h5' gutterBottom>
            All plans include
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Access to our Studio Ghibli style transformation technology, secure
            image processing, and regular updates with new features.
          </Typography>
        </Box>
      </Container>

      <Footer />
    </Box>
  )
}
