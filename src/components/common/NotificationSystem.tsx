'use client';

import React from 'react';
import { 
  Alert, 
  Snackbar, 
  Stack,
  IconButton,
  Slide,
  SlideProps
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useApp } from '@/contexts/AppContext';

// Define the slide transition
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="right" />;
}

export default function NotificationSystem() {
  const { notifications, removeNotification } = useApp();

  return (
    <Stack spacing={2} sx={{ 
      position: 'fixed', 
      bottom: 24, 
      right: 24, 
      maxWidth: '90%',
      width: 350,
      zIndex: 2000 
    }}>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          TransitionComponent={SlideTransition}
          sx={{ position: 'static', transform: 'none !important' }}
        >
          <Alert
            severity={notification.type}
            variant="filled"
            sx={{ width: '100%' }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => removeNotification(notification.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Stack>
  );
};
