'use client';

import { useState, useRef } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import Image from 'next/image';

interface ImageUploadProps {
  onFileSelected: (file: File) => void;
  imagePreview: string | null;
}

export default function ImageUpload({ onFileSelected, imagePreview }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };
  
  const handleUpload = async (file: File) => {
    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    
    setUploading(true);
    
    try {
      // Process the file (in a real app, you might want to resize/compress it here)
      // For now, just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onFileSelected(file);
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleClearImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelected(null as any);
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      
      {imagePreview ? (
        <Box sx={{ position: 'relative', width: '100%', mt: 2 }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 300,
              borderRadius: 1,
              overflow: 'hidden',
              boxShadow: 1,
            }}
          >
            <Image
              src={imagePreview}
              alt="Uploaded preview"
              fill
              style={{ objectFit: 'contain' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CloudUploadIcon />}
              onClick={handleButtonClick}
            >
              Change Image
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleClearImage}
            >
              Remove
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            backgroundColor: isDragging ? 'rgba(77, 124, 138, 0.08)' : 'transparent',
            transition: 'background-color 0.3s, border-color 0.3s',
            cursor: 'pointer',
            minHeight: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          {uploading ? (
            <CircularProgress />
          ) : (
            <>
              <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drag & Drop your image here
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                or
              </Typography>
              <Button variant="contained" color="primary" component="span">
                Browse Files
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                Supported formats: JPEG, PNG, WebP
              </Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
