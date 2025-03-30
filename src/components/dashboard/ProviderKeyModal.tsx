'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface ProviderKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  onSubscribe: () => void;
  aiProvider: {
    id: string;
    name: string;
    description: string;
  };
}

export default function ProviderKeyModal({ 
  open, 
  onClose, 
  onSubmit, 
  onSubscribe,
  aiProvider 
}: ProviderKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  
  const handleSubmit = () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    
    onSubmit(apiKey);
    setApiKey('');
    setError('');
  };
  
  const handleClose = () => {
    setApiKey('');
    setError('');
    onClose();
  };
  
  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pr: 6 }}>
        Add Your {aiProvider.name} API Key
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" paragraph>
            To continue generating Ghibli-style images, you need to provide your own {aiProvider.name} API key. 
            Your API key will be securely stored and used only for your requests.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            You've used your free transformation. You can either provide your own API key or subscribe to a plan.
          </Alert>
          
          <TextField
            label={`${aiProvider.name} API Key`}
            fullWidth
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            error={!!error}
            helperText={error}
            type={showApiKey ? 'text' : 'password'}
            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            margin="dense"
            InputProps={{
              endAdornment: (
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleShowApiKey}
                  edge="end"
                >
                  {showApiKey ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            You can find your API key in your {aiProvider.name} dashboard. Visit their website to create an account and get your key.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }}>OR</Divider>
        
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Subscribe to one of our plans for unlimited transformations
          </Typography>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={onSubscribe}
            sx={{ mt: 1 }}
          >
            View Subscription Plans
          </Button>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!apiKey.trim()}
        >
          Save API Key
        </Button>
      </DialogActions>
    </Dialog>
  );
}
