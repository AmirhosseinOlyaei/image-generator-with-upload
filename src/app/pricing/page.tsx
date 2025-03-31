'use client'

import Footer from '@/components/navigation/Footer'
import MainAppBar from '@/components/navigation/MainAppBar'
import { supabase } from '@/lib/supabase'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StarIcon from '@mui/icons-material/Star'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  Switch,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Pricing plans
const plans = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: '$5.99',
    annualPrice: '$59.99',
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
    monthlyPrice: '$12.99',
    annualPrice: '$129.99',
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
    monthlyPrice: '$29.99',
    annualPrice: '$299.99',
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

// FAQ items
const faqs = [
  {
    question: 'Do you offer a free trial?',
    answer:
      'Yes! Every new account gets one free Ghibli-style image transformation. This allows you to try our service before committing to a subscription plan.',
  },
  {
    question: 'Can I use my own AI provider API key?',
    answer:
      'Absolutely! If you already have an API key from OpenAI, Stability AI, Midjourney, or Leonardo AI, you can use it on our platform without subscribing to a plan.',
  },
  {
    question: 'What image formats are supported?',
    answer:
      'We support JPEG, PNG, and WebP formats for image uploads. The generated images are provided in high-quality JPEG format.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer:
      'Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of the current billing period.',
  },
  {
    question: 'Are the transformations perfect every time?',
    answer:
      'While our AI models are powerful, results can vary based on the input image quality, lighting, and composition. We strive to provide the best possible transformations, but like any AI technology, results may not be perfect every time.',
  },
  {
    question: 'Can I use the generated images commercially?',
    answer:
      'Commercial usage rights are included in our Ultimate plan. For Basic and Premium plans, the images are for personal use only.',
  },
]

export default function Pricing() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [annual, setAnnual] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [notification, setNotification] = useState(false)

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId)

    // Check if user is logged in
    if (!user) {
      router.push('/auth/signup')
      return
    }

    // In a real app, this would redirect to a payment page
    setNotification(true)
  }

  const handleCloseNotification = () => {
    setNotification(false)
  }

  const handlePeriodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnnual(event.target.checked)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar user={user} loading={loading} />

      <Box
        sx={{
          bgcolor: 'primary.main',
          pt: 10,
          pb: 8,
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth='md'>
          <Typography
            variant='h2'
            component='h1'
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Simple, Transparent Pricing
          </Typography>

          <Typography variant='h5' sx={{ mb: 4, opacity: 0.9 }}>
            Choose the plan that works best for your creative journey
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant='body1' sx={{ mr: 1 }}>
              Monthly
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={annual}
                  onChange={handlePeriodChange}
                  color='default'
                />
              }
              label=''
            />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant='body1' sx={{ ml: 1 }}>
                Annual
              </Typography>
              <Chip
                size='small'
                label='Save 17%'
                sx={{ ml: 1, bgcolor: 'secondary.main', color: 'white' }}
              />
            </Box>
          </Box>

          <Typography variant='body2' sx={{ opacity: 0.8 }}>
            All plans include a 14-day money-back guarantee
          </Typography>
        </Container>
      </Box>

      <Container component='main' sx={{ py: 8, flexGrow: 1 }}>
        <Grid container spacing={4} justifyContent='center'>
          {plans.map(plan => (
            <Grid item xs={12} md={4} key={plan.id}>
              <Paper
                elevation={4}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.2s ease-in-out',
                  borderColor: plan.isPopular
                    ? `${plan.color}.main`
                    : 'transparent',
                  borderWidth: plan.isPopular ? 2 : 0,
                  borderStyle: 'solid',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                  },
                }}
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
                      right: 24,
                      fontWeight: 'bold',
                    }}
                  />
                )}

                <Typography
                  variant='h4'
                  component='h2'
                  gutterBottom
                  sx={{ fontWeight: 'bold', color: `${plan.color}.main` }}
                >
                  {plan.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                  <Typography
                    variant='h3'
                    component='span'
                    sx={{ fontWeight: 'bold' }}
                  >
                    {annual ? plan.annualPrice : plan.monthlyPrice}
                  </Typography>
                  <Typography
                    variant='h6'
                    component='span'
                    color='text.secondary'
                    sx={{ ml: 1 }}
                  >
                    /{annual ? 'year' : 'month'}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <List sx={{ flexGrow: 1, mb: 3 }}>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} disableGutters sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircleIcon color={plan.color as any} />
                      </ListItemIcon>
                      <ListItemText
                        primary={feature}
                        primaryTypographyProps={{ color: 'text.primary' }}
                      />
                    </ListItem>
                  ))}
                </List>

                <Button
                  fullWidth
                  variant='contained'
                  color={plan.color as any}
                  size='large'
                  onClick={() => handleSubscribe(plan.id)}
                  sx={{
                    py: 1.5,
                    mt: 'auto',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                  }}
                >
                  {user ? 'Subscribe Now' : 'Sign Up & Subscribe'}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 12 }}>
          <Typography
            variant='h3'
            component='h2'
            gutterBottom
            textAlign='center'
            sx={{ fontWeight: 'bold', color: 'primary.dark', mb: 6 }}
          >
            Frequently Asked Questions
          </Typography>

          <Grid container spacing={3}>
            {faqs.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant='h6'
                      component='h3'
                      gutterBottom
                      sx={{ fontWeight: 'bold', color: 'primary.main' }}
                    >
                      {faq.question}
                    </Typography>
                    <Typography variant='body1' color='text.secondary'>
                      {faq.answer}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <Paper
            elevation={1}
            sx={{
              p: 4,
              borderRadius: 4,
              maxWidth: 900,
              mx: 'auto',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography
              variant='h4'
              component='h2'
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              Still have questions?
            </Typography>
            <Typography variant='body1' paragraph>
              Our team is here to help you find the perfect plan for your needs.
            </Typography>
            <Button
              variant='outlined'
              color='primary'
              size='large'
              href='mailto:support@ghiblivision.com'
              sx={{ mt: 2 }}
            >
              Contact Support
            </Button>
          </Paper>
        </Box>
      </Container>

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

      <Footer />
    </Box>
  )
}
