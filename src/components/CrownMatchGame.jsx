import React, { useState, useEffect, useRef } from 'react';
import { Box, Card, CardActionArea, Typography, Alert, Modal, Button, Snackbar } from '@mui/material';
import axios from 'axios';

const shuffleArray = (array) => {
  return array.slice().sort(() => Math.random() - 0.5).slice(0, 8); // Limit to 8 pairs for simplicity
};

const CrownMatchGame = () => {
  const [remainingCards, setRemainingCards] = useState([]);
  const [shuffledTitles, setShuffledTitles] = useState([]);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [startModalOpen, setStartModalOpen] = useState(true);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [tries, setTries] = useState(0);
  const [timer, setTimer] = useState(null);
  const [couponCode, setCouponCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const termsRef = useRef(null);
  const imagesRef = useRef(null);

  const API_BASE_URL = 'https://bosscrowns-api-a228488a1e46.herokuapp.com/bosscrowns/jeopardy';
  const GAME_TYPE = 'match-game';

  // Fetch active match game
  useEffect(() => {
    const fetchActiveGame = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_BASE_URL}/active?type=${GAME_TYPE}`);
        const activeGame = response.data;
        if (!activeGame) {
          throw new Error('No active Match game found');
        }
        setCouponCode(activeGame.couponCode || 'CROWN20');
        initializeGame(activeGame.data.cards);
      } catch (err) {
        setError(`Failed to load Match game: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveGame();
  }, []);

  const initializeGame = (cards) => {
    const shuffled = shuffleArray(cards);
    setRemainingCards(shuffled);
    setShuffledTitles(shuffleArray(shuffled));
    setShuffledImages(shuffleArray(shuffled));
    setSelectedTitle(null);
    setSelectedImage(null);
    setFeedback(null);
    setTries(0);
    setTimeElapsed(0);
  };

  const startGame = () => {
    setGameStarted(true);
    setStartModalOpen(false);
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    setTimer(interval);
  };

  const restartGame = () => {
    setEndModalOpen(false);
    setGameStarted(true);
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    setTimer(interval);
    initializeGame(remainingCards); // Reinitialize with same cards
  };

  useEffect(() => {
    if (gameStarted && remainingCards.length === 0) {
      clearInterval(timer);
      setEndModalOpen(true);
      setGameStarted(false);
    }
  }, [remainingCards, gameStarted, timer]);

  const handleTitleSelect = (id) => {
    if (!gameStarted) return;
    setSelectedTitle(id === selectedTitle ? null : id);
    setSelectedImage(null);
    setFeedback(null);
    if (imagesRef.current) {
      imagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleImageSelect = (imageId) => {
    if (!selectedTitle || !gameStarted) return;
    setSelectedImage(imageId);
    setTries((prev) => prev + 1);

    const titleCard = remainingCards.find((card) => card.id === selectedTitle);
    const isMatch = titleCard.id === imageId;

    setFeedback({
      type: isMatch ? 'success' : 'error',
      message: isMatch ? 'Correct match!' : 'Incorrect match. Try again.',
    });

    if (isMatch) {
      setTimeout(() => {
        setRemainingCards(remainingCards.filter((card) => card.id !== selectedTitle));
        setShuffledTitles(shuffledTitles.filter((card) => card.id !== selectedTitle));
        setShuffledImages(shuffledImages.filter((card) => card.id !== selectedTitle));
        setSelectedTitle(null);
        setSelectedImage(null);
        setFeedback(null);
        if (termsRef.current) {
          termsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1500);
    }
  };

  const handleSnackbarClose = () => {
    setFeedback(null);
  };

  const cardStyle = {
    width: 200,
    height: 250,
    borderRadius: 8,
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
    background: '#FFFFFF',
    border: `2px solid #B43361`,
    overflow: 'hidden',
    position: 'relative',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)',
    },
  };

  const imageCardStyle = {
    ...cardStyle,
    background: 'linear-gradient(135deg, #B43361, #8B2A4C)',
  };

  const selectedCardStyle = {
    ...cardStyle,
    border: `2px solid #121212`,
    background: '#FFFFFF',
  };

  const selectedImageStyle = (isSuccess) => ({
    ...imageCardStyle,
    border: isSuccess ? `2px solid #121212` : `2px solid #B43361`,
    background: isSuccess
      ? 'linear-gradient(135deg, #FFFFFF, #F3D4D4)'
      : 'linear-gradient(135deg, #B43361, #8B2A4C)',
  });

  const cardContentStyle = {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
    color: '#FFFFFF',
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#FFFFFF',
    border: `2px solid #B43361`,
    boxShadow: 24,
    p: 4,
    borderRadius: 8,
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, bgcolor: '#FFFFFF', minHeight: '100vh', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#121212' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, bgcolor: '#FFFFFF', minHeight: '100vh', textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: '#d32f2f' }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, bgcolor: '#FFFFFF', minHeight: '100vh' }}>
      <Modal open={startModalOpen} onClose={() => {}}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom sx={{ color: '#B43361' }}>
            Welcome to Crown Match Game!
          </Typography>
          <Typography variant="body1" gutterBottom>
            Match the wig names to their images to unlock a coupon code!
            <ul>
              <li>Select a wig name first.</li>
              <li>Then select the matching wig image.</li>
              <li>Match all pairs to win!</li>
            </ul>
          </Typography>
          <Button variant="contained" onClick={startGame} sx={{ mt: 2 }}>
            Start Game
          </Button>
        </Box>
      </Modal>

      <Box ref={termsRef} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#121212' }}>
          Wig Names
        </Typography>
        {shuffledTitles.length === 0 && gameStarted ? (
          <Typography variant="body1" sx={{ textAlign: 'center', color: '#121212' }}>
            All matches completed! Great job!
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {shuffledTitles.map((card) => (
              <Card key={card.id} sx={selectedTitle === card.id ? selectedCardStyle : cardStyle}>
                <CardActionArea onClick={() => handleTitleSelect(card.id)} sx={{ height: '100%' }}>
                  <Box sx={cardContentStyle}>
                    <Typography
                      variant="button"
                      sx={{
                        wordBreak: 'break-word',
                        fontSize: '1.1rem',
                        color: '#FFFFFF',
                      }}
                    >
                      {card.title}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      <Box ref={imagesRef} sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#121212' }}>
          Wig Images
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          {shuffledImages.map((card) => (
            <Card
              key={card.id}
              sx={
                selectedImage === card.id && feedback
                  ? selectedImageStyle(feedback.type === 'success')
                  : { ...imageCardStyle, opacity: selectedTitle ? 1 : 0.5, pointerEvents: selectedTitle ? 'auto' : 'none' }
              }
            >
              <CardActionArea onClick={() => handleImageSelect(card.id)} sx={{ height: '100%' }} disabled={!selectedTitle}>
                <Box sx={{ ...cardContentStyle, p: 0 }}>
                  <img src={card.image} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>

      <Snackbar
        open={!!feedback}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ zIndex: 1500 }}
      >
        <Alert severity={feedback?.type} sx={{ width: '100%' }}>
          {feedback?.message}
        </Alert>
      </Snackbar>

      <Modal open={endModalOpen} onClose={() => {}}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom sx={{ color: '#B43361' }}>
            Game Over!
          </Typography>
          <Typography variant="body1" gutterBottom>
            Time Elapsed: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')} minutes
          </Typography>
          <Typography variant="body1" gutterBottom>
            Tries: {tries}
          </Typography>
          {couponCode && (
            <Typography variant="body1" gutterBottom sx={{ color: '#B43361', fontWeight: 'bold' }}>
              Your Coupon Code: {couponCode}
            </Typography>
          )}
          <Button variant="contained" onClick={restartGame}>
            Play Again
          </Button>
        </Box>
      </Modal>

      {gameStarted && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: '#FFFFFF',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
            borderRadius: '8px',
            padding: '12px',
            width: '180px',
            textAlign: 'center',
            zIndex: 1400,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#B43361', mb: 1 }}>
            Game Stats
          </Typography>
          <Typography variant="body1" sx={{ color: '#121212' }}>
            Time: {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#121212' }}>
            Tries: {tries}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CrownMatchGame;