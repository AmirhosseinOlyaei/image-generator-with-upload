'use client'

import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material'
import React, { useState } from 'react'

// Define subscription plan types
interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
  credits: number
  description: string
  popular?: boolean
}

interface SubscriptionModalProps {
  open: boolean
  onClose: () => void
  currentPlan: string
}

export default function SubscriptionModal({
  open,
  onClose,
  currentPlan,
}: SubscriptionModalProps) {
  const theme = useTheme()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Mock subscription plans
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      credits: 5,
      description: 'Basic access with limited features',
      features: [
        '5 AI image generations per month',
        'Standard quality images',
        'Basic prompt assistance',
        'Community support',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      credits: 50,
      description: 'Enhanced features for creative professionals',
      features: [
        '50 AI image generations per month',
        'High quality images',
        'Advanced prompt assistance',
        'Priority support',
        'Commercial usage rights',
      ],
      popular: true,
    },
    {
      id: 'unlimited',
      name: 'Unlimited',
      price: 29.99,
      credits: 1000,
      description: 'Unlimited access for power users',
      features: [
        'Unlimited AI image generations',
        'Maximum quality images',
        'Premium prompt assistance',
        'Dedicated support',
        'Commercial usage rights',
        'Early access to new features',
      ],
    },
  ]

  const handleSubscribe = (planId: string) => {
    // In a static site, we'll just show a notification
    // eslint-disable-next-line no-console
    console.log(`Subscribing to ${planId} plan (demo only)`)
    setSelectedPlan(planId)
    setLoading(true)

    // Close the modal after a short delay to simulate processing
    setTimeout(() => {
      setLoading(false)
      onClose()
    }, 1500)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='lg'
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: 'paper',
          overflow: 'hidden',
        },
      }}
      aria-labelledby='subscription-dialog-title'
    >
      <DialogTitle id='subscription-dialog-title' sx={{ p: 3 }}>
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: theme => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant='h6' component='div' sx={{ fontWeight: 600 }}>
          Choose Your Subscription Plan
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          Select the plan that best fits your creative needs
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 4 }}>
        <Grid container spacing={3}>
          {subscriptionPlans.map(plan => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                variant='outlined'
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  border: selectedPlan === plan.id ? 2 : 1,
                  borderColor:
                    selectedPlan === plan.id ? 'primary.main' : 'divider',
                  boxShadow:
                    selectedPlan === plan.id
                      ? '0 4px 12px rgba(0,0,0,0.1)'
                      : 'none',
                  ...(plan.popular && {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  }),
                }}
              >
                {plan.popular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    POPULAR
                  </Box>
                )}
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Typography variant='h5' component='div' gutterBottom>
                    {plan.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                    <Typography variant='h4' component='span' fontWeight={700}>
                      ${plan.price}
                    </Typography>
                    <Typography
                      variant='subtitle1'
                      component='span'
                      color='text.secondary'
                      sx={{ ml: 1 }}
                    >
                      /month
                    </Typography>
                  </Box>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    paragraph
                    sx={{ mb: 2 }}
                  >
                    {plan.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List disablePadding>
                    {plan.features.map((feature, index) => (
                      <ListItem
                        key={index}
                        disablePadding
                        sx={{ py: 0.5, px: 0 }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleIcon
                            color='primary'
                            fontSize='small'
                            sx={{ opacity: 0.9 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 500,
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <Box sx={{ p: 3, pt: 0 }}>
                  <Button
                    fullWidth
                    variant='contained'
                    color='primary'
                    size='large'
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={
                      plan.id === currentPlan ||
                      (loading && selectedPlan === plan.id)
                    }
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      ...(plan.popular && {
                        bgcolor: theme.palette.primary.main,
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark,
                        },
                      }),
                    }}
                  >
                    {loading && selectedPlan === plan.id
                      ? 'Processing...'
                      : plan.price === 0
                        ? 'Get Started'
                        : plan.id === currentPlan
                          ? 'Current Plan'
                          : 'Subscribe Now'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{ fontStyle: 'italic' }}
          >
            Note: This is a demo only. No actual subscription will be processed.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
