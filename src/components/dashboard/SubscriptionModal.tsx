'use client'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import StarIcon from '@mui/icons-material/Star'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'

interface SubscriptionModalProps {
  open: boolean
  onClose: () => void
}

// Subscription plans
const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$5.99',
    period: 'month',
    features: [
      '15 Ghibli transformations per month',
      'All AI providers available',
      'Standard resolution images',
      'Email support',
    ],
    isPopular: false,
    color: 'primary',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$12.99',
    period: 'month',
    features: [
      '50 Ghibli transformations per month',
      'All AI providers available',
      'High resolution images',
      'Priority email support',
      'Advanced prompt customization',
      'Remove watermarks',
    ],
    isPopular: true,
    color: 'secondary',
  },
  {
    id: 'ultimate',
    name: 'Ultimate',
    price: '$29.99',
    period: 'month',
    features: [
      'Unlimited Ghibli transformations',
      'All AI providers available',
      'Ultra-high resolution images',
      'Priority email & chat support',
      'Advanced prompt customization',
      'Remove watermarks',
      'Commercial usage rights',
      'Batch processing (up to 10 images)',
    ],
    isPopular: false,
    color: 'primary',
  },
]

export default function SubscriptionModal({
  open,
  onClose,
}: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [notification, setNotification] = useState(false)

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handleSubscribe = () => {
    // In a real application, this would redirect to a payment processor
    setNotification(true)
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  const handleCloseNotification = () => {
    setNotification(false)
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          Choose Your Subscription Plan
          <IconButton
            aria-label='close'
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

        <DialogContent>
          <Typography variant='body1' paragraph>
            Unlock unlimited Ghibli-style transformations with one of our
            subscription plans. Choose the plan that suits your needs and start
            transforming your photos today.
          </Typography>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {plans.map(plan => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Paper
                  elevation={selectedPlan === plan.id ? 6 : 2}
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'all 0.2s ease-in-out',
                    borderColor:
                      selectedPlan === plan.id
                        ? `${plan.color}.main`
                        : 'transparent',
                    borderWidth: 2,
                    borderStyle: 'solid',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.isPopular && (
                    <Chip
                      label='Most Popular'
                      color='secondary'
                      size='small'
                      icon={<StarIcon />}
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: 20,
                        fontWeight: 'bold',
                      }}
                    />
                  )}

                  <Typography
                    variant='h5'
                    component='h3'
                    gutterBottom
                    sx={{ fontWeight: 'bold', color: `${plan.color}.main` }}
                  >
                    {plan.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                    <Typography
                      variant='h3'
                      component='span'
                      sx={{ fontWeight: 'bold' }}
                    >
                      {plan.price}
                    </Typography>
                    <Typography
                      variant='body1'
                      component='span'
                      color='text.secondary'
                      sx={{ ml: 1 }}
                    >
                      /{plan.period}
                    </Typography>
                  </Box>

                  <List sx={{ flexGrow: 1, mb: 2 }}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleIcon
                            color={plan.color as any}
                            fontSize='small'
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: 'text.primary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    fullWidth
                    variant={
                      selectedPlan === plan.id ? 'contained' : 'outlined'
                    }
                    color={plan.color as any}
                    size='large'
                    sx={{ mt: 'auto' }}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubscribe}
            variant='contained'
            disabled={!selectedPlan}
            color='primary'
            size='large'
          >
            Subscribe Now
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity='info'
          sx={{ width: '100%' }}
        >
          Subscription functionality is not available in this demo. This is UI
          only.
        </Alert>
      </Snackbar>
    </>
  )
}
