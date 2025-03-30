'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import HeroSection from '@/components/landing/HeroSection';
import GhibliShowcase from '@/components/landing/GhibliShowcase';
import HowItWorks from '@/components/landing/HowItWorks';
import MainAppBar from '@/components/navigation/MainAppBar';
import Footer from '@/components/navigation/Footer';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signin');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar user={user} loading={loading} />
      
      <main style={{ flex: 1 }}>
        <HeroSection onGetStarted={handleGetStarted} />
        <GhibliShowcase />
        <HowItWorks />
        
        <Box sx={{ backgroundColor: 'primary.light', py: 8, textAlign: 'center' }}>
          <Container maxWidth="md">
            <Typography variant="h2" component="h2" gutterBottom 
              sx={{ color: 'white', fontWeight: 'bold', mb: 4 }}>
              Ready to Transform Your Photos?
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              onClick={handleGetStarted}
              sx={{ 
                fontSize: '1.2rem', 
                py: 1.5, 
                px: 4, 
                boxShadow: '0px 8px 16px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0px 10px 20px rgba(0,0,0,0.25)',
                }
              }}
            >
              {user ? 'Go to Dashboard' : 'Get Started Now'}
            </Button>
          </Container>
        </Box>
      </main>
      
      <Footer />
    </Box>
  );
}
