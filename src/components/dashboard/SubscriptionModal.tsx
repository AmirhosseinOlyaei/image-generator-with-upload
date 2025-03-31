'use client'

import {
  Box,
  Button,
  Card,
  CardActions,
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
} from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import React from 'react'

interface SubscriptionModalProps {
  open: boolean
  onClose: () => void
  currentPlan: string
}

// Subscription plan data
const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'Basic access to Ghibli transformations',
    features: [
      '10 transformations per month',
      'Standard quality images',
      'OpenAI DALL-E 3 support',
      'Email support',
    ],
    buttonText: 'Current Plan',
    recommended: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99',
    period: 'month',
    description: 'For enthusiasts who want more transformations',
    features: [
      '100 transformations per month',
      'High quality images',
      'All AI providers support',
      'Priority email support',
      'No watermarks',
    ],
    buttonText: 'Upgrade to Pro',
    recommended: true,
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    price: '$19.99',
    period: 'month',
    description: 'For professionals with unlimited needs',
    features: [
      'Unlimited transformations',
      'Highest quality images',
      'All AI providers support',
      'Priority email & chat support',
      'No watermarks',
      'API access',
      'Commercial usage rights',
    ],
    buttonText: 'Upgrade to Unlimited',
    recommended: false,
  },
]

export default function SubscriptionModal({
  open,
  onClose,
  currentPlan: _currentPlan, // Rename to _currentPlan to indicate it's unused
}: SubscriptionModalProps) {
  const handleSubscribe = (planId: string) => {
    // In a static site, we'll just show a notification
    // eslint-disable-next-line no-console
    console.log(`Subscribing to ${planId} plan`)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={'lg'}
      fullWidth
      scroll={'paper'}
      aria-labelledby={'subscription-dialog-title'}
    >
      <DialogTitle id={'subscription-dialog-title'} sx={{ pr: 6 }}>
        Subscription Plans
        <IconButton
          aria-label={'close'}
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant={'h6'} gutterBottom>
          Choose the plan that works for you
        </Typography>
        <Typography variant={'body2'} color={'text.secondary'} paragraph>
          All plans include access to our Ghibli transformation technology.
          Upgrade for more transformations and features.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {plans.map(plan => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Card
                variant={'outlined'}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  ...(plan.recommended && {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                  }),
                }}
              >
                {plan.recommended && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    RECOMMENDED
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant={'h5'} component={'div'} gutterBottom>
                    {plan.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                    <Typography variant={'h4'} component={'span'}>
                      {plan.price}
                    </Typography>
                    {plan.period && (
                      <Typography
                        variant={'subtitle1'}
                        component={'span'}
                        color={'text.secondary'}
                        sx={{ ml: 1 }}
                      >
                        /{plan.period}
                      </Typography>
                    )}
                  </Box>
                  <Typography
                    variant={'body2'}
                    color={'text.secondary'}
                    sx={{ mb: 2 }}
                  >
                    {plan.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <List dense disablePadding>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} disableGutters disablePadding>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleOutlineIcon
                            color={'primary'}
                            fontSize={'small'}
                          />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={plan.id === 'free' ? 'outlined' : 'contained'}
                    color={plan.recommended ? 'primary' : 'inherit'}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={plan.id === 'free'}
                  >
                    {plan.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant={'body2'} color={'text.secondary'}>
            All plans come with a 7-day money-back guarantee.
            <br />
            Have questions? Contact our{' '}
            <a href={'mailto:support@example.com'}>support team</a>.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
