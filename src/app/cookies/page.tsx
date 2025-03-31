'use client'

import Footer from '@/components/navigation/Footer'
import MainAppBar from '@/components/navigation/MainAppBar'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/navigation'

export default function CookiePolicy() {
  const router = useRouter()

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar user={null} loading={false} />

      <Container component='main' sx={{ flexGrow: 1, py: 8 }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ mb: 3 }}
          >
            Back
          </Button>

          <Typography
            variant='h4'
            component='h1'
            gutterBottom
            sx={{ fontWeight: 'bold', color: 'primary.main' }}
          >
            Cookie Policy
          </Typography>

          <Typography variant='subtitle1' color='text.secondary' paragraph>
            Last updated: March 30, 2025
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            1. Introduction
          </Typography>
          <Typography variant='body1' paragraph>
            This Cookie Policy explains how Ghibli Vision ("we", "our", or "us")
            uses cookies and similar technologies to recognize you when you
            visit our website. It explains what these technologies are and why
            we use them, as well as your rights to control our use of them.
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            2. What Are Cookies?
          </Typography>
          <Typography variant='body1' paragraph>
            Cookies are small data files that are placed on your computer or
            mobile device when you visit a website. Cookies are widely used by
            website owners to make their websites work, or to work more
            efficiently, as well as to provide reporting information.
          </Typography>
          <Typography variant='body1' paragraph>
            Cookies set by the website owner (in this case, Ghibli Vision) are
            called "first-party cookies". Cookies set by parties other than the
            website owner are called "third-party cookies". Third-party cookies
            enable third-party features or functionality to be provided on or
            through the website (e.g., advertising, interactive content, and
            analytics).
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            3. Why Do We Use Cookies?
          </Typography>
          <Typography variant='body1' paragraph>
            We use first-party and third-party cookies for several reasons. Some
            cookies are required for technical reasons in order for our website
            to operate, and we refer to these as "essential" or "strictly
            necessary" cookies. Other cookies enable us to track and target the
            interests of our users to enhance the experience on our website.
            Third parties serve cookies through our website for advertising,
            analytics, and other purposes.
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            4. Types of Cookies We Use
          </Typography>
          <Typography variant='body1' paragraph>
            The specific types of first and third-party cookies served through
            our website and the purposes they perform include:
          </Typography>

          <Typography
            variant='h6'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 2 }}
          >
            Essential Cookies
          </Typography>
          <Typography variant='body1' paragraph>
            These cookies are strictly necessary to provide you with services
            available through our website and to use some of its features, such
            as access to secure areas. Without these cookies, services you have
            asked for cannot be provided.
          </Typography>

          <Typography
            variant='h6'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 2 }}
          >
            Performance and Functionality Cookies
          </Typography>
          <Typography variant='body1' paragraph>
            These cookies are used to enhance the performance and functionality
            of our website but are non-essential to their use. However, without
            these cookies, certain functionality may become unavailable.
          </Typography>

          <Typography
            variant='h6'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 2 }}
          >
            Analytics and Customization Cookies
          </Typography>
          <Typography variant='body1' paragraph>
            These cookies collect information that is used either in aggregate
            form to help us understand how our website is being used or how
            effective our marketing campaigns are, or to help us customize our
            website for you.
          </Typography>

          <Typography
            variant='h6'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 2 }}
          >
            Advertising Cookies
          </Typography>
          <Typography variant='body1' paragraph>
            These cookies are used to make advertising messages more relevant to
            you. They perform functions like preventing the same ad from
            continuously reappearing, ensuring that ads are properly displayed,
            and in some cases selecting advertisements that are based on your
            interests.
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            5. How Can You Control Cookies?
          </Typography>
          <Typography variant='body1' paragraph>
            You have the right to decide whether to accept or reject cookies.
            You can exercise your cookie preferences by clicking on the
            appropriate opt-out links provided in our cookie notice banner.
          </Typography>
          <Typography variant='body1' paragraph>
            You can also set or amend your web browser controls to accept or
            refuse cookies. If you choose to reject cookies, you may still use
            our website, but your access to some functionality and areas of our
            website may be restricted.
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            6. Changes to This Cookie Policy
          </Typography>
          <Typography variant='body1' paragraph>
            We may update this Cookie Policy from time to time in order to
            reflect, for example, changes to the cookies we use or for other
            operational, legal, or regulatory reasons. Please therefore re-visit
            this Cookie Policy regularly to stay informed about our use of
            cookies and related technologies.
          </Typography>

          <Typography
            variant='h5'
            gutterBottom
            sx={{ fontWeight: 'bold', mt: 4 }}
          >
            7. Contact Us
          </Typography>
          <Typography variant='body1' paragraph>
            If you have any questions about our use of cookies or other
            technologies, please email us at privacy@ghiblivision.com.
          </Typography>
        </Paper>
      </Container>

      <Footer />
    </Box>
  )
}
