import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Modal,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import Slider from 'react-slick';
import YouTube from 'react-youtube';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const API_BASE_URL = 'https://bosscrowns-api-a228488a1e46.herokuapp.com/bosscrowns/colorIndex';

// Styled components
const CollectionHeader = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  borderBottom: `2px solid ${theme.palette.primary.main}`,
  textAlign: 'left',
  paddingBottom: theme.spacing(1),
}));

const ColorCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
}));

const ImageModal = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '90vw',
  maxHeight: '90vh',
  bgcolor: 'transparent',
  boxShadow: 'none',
  p: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  outline: 'none',
  width: '100%',
  height: '100%',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  color: theme.palette.common.white,
  backgroundColor: theme.palette.grey[800],
  '&:hover': {
    backgroundColor: theme.palette.grey[900],
  },
  zIndex: 10, // Ensure button is above carousel
}));

// Custom styles for react-slick dots
const customSliderStyles = `
  .slick-dots li {
    margin: 0 4px;
  }
  .slick-dots li button {
    background: transparent !important;
    width: 10px;
    height: 10px;
  }
  .slick-dots li button:before {
    content: '•';
    font-size: 12px;
    color: #000 !important;
    background: transparent !important;
    opacity: 0.6;
    width: 10px;
    height: 10px;
    line-height: 10px;
    text-align: center;
  }
  .slick-dots li.slick-active button:before {
    opacity: 1;
    color: #000 !important;
    background: transparent !important;
  }
`;

const ColorSwatches = () => {
  const [colorIndex, setColorIndex] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleVideos, setVisibleVideos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // Carousel settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  // Modal carousel settings
  const modalCarouselSettings = {
    ...carouselSettings,
    arrows: true,
    dots: true,
  };

  // YouTube player options
  const youtubeOpts = {
    height: '150',
    width: '100%',
    playerVars: {
      autoplay: 0,
    },
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched color index data:', data);
      setColorIndex(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const collections = ['All', ...[...new Set(colorIndex.map((color) => color.collection))].sort()];
  const brands = ['All', ...[...new Set(colorIndex.map((color) => color.brand))].sort()];

  const filteredColors = colorIndex.filter((color) => {
    const matchesCollection = selectedCollection === 'All' || color.collection === selectedCollection;
    const matchesBrand = selectedBrand === 'All' || color.brand === selectedBrand;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      color.collection.toLowerCase().includes(searchLower) ||
      color.name.toLowerCase().includes(searchLower) ||
      color.description.toLowerCase().includes(searchLower) ||
      (color.brand || '').toLowerCase().includes(searchLower);
    return matchesCollection && matchesBrand && matchesSearch;
  });

  const groupedCollections = [...new Set(filteredColors.map((color) => color.collection))].sort();

  const toggleVideo = (id) => {
    setVisibleVideos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openImageModal = (images) => {
    setSelectedImages(images.length > 0 ? images : ['https://via.placeholder.com/200x200?text=Color+Swatch']);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImages([]);
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/200x200?text=Error+Loading+Image';
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Inject custom styles for dots */}
      <style>{customSliderStyles}</style>

      <Typography variant="h4" align="left" gutterBottom>
        Boss Crowns Color Index
      </Typography>

      {loading && (
        <Typography variant="body1" align="center" color="text.secondary">
          Loading colors...
        </Typography>
      )}
      {error && (
        <Typography variant="body1" align="center" color="error">
          Error: {error}
        </Typography>
      )}

      {!loading && !error && (
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            label="Search by Collection, Name, Description, or Brand"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            sx={{ flex: 1 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Collection</InputLabel>
            <Select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              label="Collection"
            >
              {collections.map((collection) => (
                <MenuItem key={collection} value={collection}>
                  {collection}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Brand</InputLabel>
            <Select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              label="Brand"
            >
              {brands.map((brand) => (
                <MenuItem key={brand} value={brand}>
                  {brand}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {!loading && !error && filteredColors.length === 0 && (
        <Typography variant="body1" align="center" color="text.secondary">
          No colors match your search or filter criteria.
        </Typography>
      )}

      {!loading && !error && groupedCollections.map((collection) => (
        <Box key={collection} sx={{ mb: 4 }}>
          <CollectionHeader variant="h4">
            {collection}
          </CollectionHeader>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              justifyContent: 'flex-start',
            }}
          >
            {filteredColors
              .filter((color) => color.collection === collection)
              .map((color) => (
                <Box
                  key={color.id}
                  sx={{
                    flex: {
                      xs: '1 1 100%',
                      sm: '1 1 calc(50% - 12px)',
                      md: '1 1 calc(33.33% - 16px)',
                      lg: '1 1 calc(25% - 18px)',
                    },
                    maxWidth: {
                      xs: '100%',
                      sm: 'calc(50% - 12px)',
                      md: 'calc(33.33% - 16px)',
                      lg: 'calc(25% - 18px)',
                    },
                  }}
                >
                  <ColorCard>
                    <Slider {...carouselSettings}>
                      {(color.image.length > 0 ? color.image : ['https://via.placeholder.com/200x200?text=Color+Swatch'])
                        .map((img, index) => (
                          <Box key={index}>
                            <CardMedia
                              component="img"
                              height="200"
                              image={img}
                              alt={`${color.name} ${index + 1}`}
                              sx={{ objectFit: 'cover', cursor: 'pointer' }}
                              onClick={() => openImageModal(color.image)}
                              onError={handleImageError}
                            />
                          </Box>
                        ))}
                    </Slider>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {color.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {color.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Chip label={`Brand: ${color.brand}`} size="small" color="info" variant="outlined" />
                        <Chip label={`Tone: ${color.tone}`} size="small" color="primary" variant="outlined" />
                        <Chip
                          label={color.rooted ? 'Rooted' : 'Unrooted'}
                          size="small"
                          color={color.rooted ? 'success' : 'default'}
                          variant="outlined"
                        />
                        <Chip
                          label={color.highlighted ? 'Highlighted' : 'No Highlights'}
                          size="small"
                          color={color.highlighted ? 'warning' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Code: {color.code || 'N/A'}
                      </Typography>
                      {color.video && getYouTubeId(color.video) && (
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            label="Watch Video"
                            size="small"
                            color="secondary"
                            onClick={() => toggleVideo(color.id)}
                            clickable
                            sx={{ cursor: 'pointer' }}
                          />
                          {visibleVideos[color.id] && (
                            <Box sx={{ mt: 2 }}>
                              <YouTube
                                videoId={getYouTubeId(color.video)}
                                opts={youtubeOpts}
                                onError={() => alert('Error loading YouTube video')}
                              />
                            </Box>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </ColorCard>
                </Box>
              ))}
          </Box>
        </Box>
      ))}

      <Modal
        open={imageModalOpen}
        onClose={closeImageModal}
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
      >
        <ImageModal>
          <CloseButton onClick={closeImageModal}>
            <CloseIcon />
          </CloseButton>
          <Slider {...modalCarouselSettings} style={{ width: '90vw', maxHeight: '80vh' }}>
            {selectedImages.map((img, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img
                  src={img}
                  alt={`Selected color ${index + 1}`}
                  style={{ width: '100%', height: '80vh', objectFit: 'contain' }}
                  onError={handleImageError}
                />
              </Box>
            ))}
          </Slider>
        </ImageModal>
      </Modal>
    </Container>
  );
};

export default ColorSwatches;