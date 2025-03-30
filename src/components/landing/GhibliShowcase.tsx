'use client';

import { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

// Sample Ghibli images data with descriptions
const ghibliSamples = [
  {
    id: 1,
    title: "Spirited Away Landscape",
    description: "Inspired by the surreal bathhouse landscape in Spirited Away",
    image: "/images/ghibli-sample-1.jpg"
  },
  {
    id: 2,
    title: "My Neighbor Totoro",
    description: "Featuring the iconic forest spirits and lush greenery from Totoro",
    image: "/images/ghibli-sample-2.jpg"
  },
  {
    id: 3,
    title: "Howl's Moving Castle",
    description: "Showcasing the steampunk-inspired design of Howl's castle",
    image: "/images/ghibli-sample-3.jpg"
  },
  {
    id: 4,
    title: "Princess Mononoke",
    description: "Capturing the mystical forest and creatures from Princess Mononoke",
    image: "/images/ghibli-sample-4.jpg"
  },
  {
    id: 5,
    title: "Kiki's Delivery Service",
    description: "Featuring the charming European-inspired town from Kiki's adventures",
    image: "/images/ghibli-sample-5.jpg"
  },
  {
    id: 6,
    title: "Ponyo Seascape",
    description: "Displaying the vibrant underwater world from Ponyo",
    image: "/images/ghibli-sample-6.jpg"
  }
];

export default function GhibliShowcase() {
  const [startIndex, setStartIndex] = useState(0);
  const itemsToShow = 3; // Number of cards to show at once
  
  const handlePrevious = () => {
    setStartIndex((prev) => (prev > 0 ? prev - 1 : ghibliSamples.length - itemsToShow));
  };
  
  const handleNext = () => {
    setStartIndex((prev) => (prev < ghibliSamples.length - itemsToShow ? prev + 1 : 0));
  };

  // Get the current items to display
  const currentItems = [...ghibliSamples, ...ghibliSamples].slice(startIndex, startIndex + itemsToShow);

  return (
    <Box sx={{ py: 10, bgcolor: '#F7F9FA' }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h2" 
          component="h2" 
          align="center"
          sx={{ 
            mb: 2,
            color: 'primary.dark',
            fontWeight: 'bold'
          }}
        >
          Ghibli-Inspired Masterpieces
        </Typography>
        
        <Typography 
          variant="h5" 
          component="p" 
          align="center"
          sx={{ 
            mb: 6,
            color: 'text.secondary',
            maxWidth: 800,
            mx: 'auto'
          }}
        >
          Explore the enchanting world of Studio Ghibli and see how your photos can be transformed
        </Typography>
        
        <Box sx={{ position: 'relative', px: { xs: 2, md: 6 } }}>
          <IconButton 
            onClick={handlePrevious}
            sx={{ 
              position: 'absolute', 
              left: 0, 
              top: '50%', 
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper', opacity: 0.9 }
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
          
          <Grid container spacing={3}>
            {currentItems.map((item, index) => (
              <Grid item xs={12} md={4} key={`${item.id}-${index}`}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 30px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={item.image}
                    alt={item.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <IconButton 
            onClick={handleNext}
            sx={{ 
              position: 'absolute', 
              right: 0, 
              top: '50%', 
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper', opacity: 0.9 }
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}
