'use client'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'

interface ProviderKeyModalProps {
  open: boolean
  onClose: () => void
  onSave: (provider: string, key: string) => void
  provider: string
}

export default function ProviderKeyModal({
  open,
  onClose,
  onSave,
  provider,
}: ProviderKeyModalProps) {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setApiKey('')
      setError(null)
    }
  }, [open])

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value)
    setError(null)
  }

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API key cannot be empty')
      return
    }

    // Basic validation based on provider
    if (provider === 'openai' && !apiKey.startsWith('sk-')) {
      setError('OpenAI API keys should start with "sk-"')
      return
    }

    onSave(provider, apiKey.trim())
  }

  const getProviderName = (providerId: string): string => {
    const providerMap: Record<string, string> = {
      openai: 'OpenAI',
      stability: 'Stability AI',
      midjourney: 'Midjourney',
      leonardo: 'Leonardo AI',
    }

    return providerMap[providerId] || providerId
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Set API Key for {getProviderName(provider)}</DialogTitle>
      <DialogContent>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Enter your API key for {getProviderName(provider)} to use their image
          generation services. Your key will be securely stored.
        </Typography>

        <TextField
          autoFocus
          margin='dense'
          label='API Key'
          type='password'
          fullWidth
          variant='outlined'
          value={apiKey}
          onChange={handleApiKeyChange}
          error={!!error}
          helperText={error}
        />

        <Box sx={{ mt: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            How to get an API key:
          </Typography>
          <ol>
            <li>
              <Typography variant='body2'>
                Go to{' '}
                <a
                  href={
                    provider === 'openai'
                      ? 'https://platform.openai.com/account/api-keys'
                      : '#'
                  }
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {getProviderName(provider)} API dashboard
                </a>
              </Typography>
            </li>
            <li>
              <Typography variant='body2'>
                Create a new API key or use an existing one
              </Typography>
            </li>
            <li>
              <Typography variant='body2'>
                Copy and paste the key above
              </Typography>
            </li>
          </ol>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant='contained'
          color='secondary'
          sx={{ mt: 1 }}
          onClick={handleSave}
        >
          Save API Key
        </Button>
      </DialogActions>
    </Dialog>
  )
}
