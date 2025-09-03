import React from 'react';
import { AppBar, Toolbar, Button, Box, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/bc-logo-light.png'; // Adjust path to your logo

const CustomAppBar = () => {
  const navigate = useNavigate();



  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: '#FFFFFF',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #E0E0E0',
        display: 'flex',
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 48, sm: 56, md: 64 }, // Responsive height
          display: 'flex',
          justifyContent: 'flex-start', // Align items to the left
          alignItems: 'center',
          px: { xs: 1, sm: 2 },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mr: 2, // Margin-right to separate logo from Home button
          }}
        >
          <img
            src={logo}
            alt="BossCrowns Logo"
            style={{
              height: { xs: '32px', sm: '40px', md: '48px' }, // Responsive logo size
              maxWidth: '150px',
              objectFit: 'contain',
              padding: 15, // Add some padding around the logo
            }}
          />
        </Box>

        {/* Home Button */}
        <a
        href='https://bosscrowns.me'
          style={{
            textDecoration: 'none',
            color: '#333333', // Light gray text
            textTransform: 'none', // Remove uppercase
            fontSize: { xs: '14px', sm: '16px' }, // Responsive font size
            fontWeight: 400,
            '&:hover': {
              color: '#333333 !important', // Darker gray on hover
              backgroundColor: 'transparent', // No background on hover
            },
          }}
        >
          Home
        </a>
      </Toolbar>
    </AppBar>
  );
};

export default CustomAppBar;