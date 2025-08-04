import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Card, CardActionArea, Modal, Button, Grid, Paper, Divider, Radio, RadioGroup, FormControlLabel, FormControl, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { API } from '../config/API';
import { jeopardyWigData } from '../data/jeopardyWigData';

const WigJeopardy = () => {
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [maxHeaderHeight, setMaxHeaderHeight] = useState(0);
  const [jeopardyData, setJeopardyData] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [couponCode, setCouponCode] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const headerRefs = useRef([]);

  useEffect(() => {
    const initializeGame = async () => {
      setLoading(true);
      try {
        await fetchLatestGame();
      } catch (error) {
        console.error('Error initializing game:', error);
        setJeopardyData(jeopardyWigData);
        setGameId(jeopardyWigData.gameId || 'default');
        await loadGameData(jeopardyWigData.gameId || 'default');
      } finally {
        setLoading(false);
      }
    };
    initializeGame();
  }, []);

  useEffect(() => {
    if (!jeopardyData) return;
    const heights = headerRefs.current.map((ref) => ref?.offsetHeight || 0);
    const maxHeight = Math.max(...heights, 60); // Minimum height of 60px
    setMaxHeaderHeight(maxHeight);

    // Check if all questions are answered to generate coupon code
    const totalQuestions = jeopardyData.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    if (answeredQuestions.length === totalQuestions) {
      setCouponCode(`WIG${score}`); // e.g., WIG25 for 25% off
    }
  }, [jeopardyData, answeredQuestions]);

  const fetchLatestGame = async () => {
    try {
      const response = await fetch(`${API}/apu/jeopardy/latest`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch latest game');
      const latestGame = await response.json();
      setJeopardyData({
        gameId: latestGame.id,
        categories: latestGame.categories,
      });
      setGameId(latestGame.id);
      await loadGameData(latestGame.id);
    } catch (error) {
      console.error('Error fetching latest game:', error);
      setJeopardyData(jeopardyWigData);
      setGameId(jeopardyWigData.gameId || 'default');
      await loadGameData(jeopardyWigData.gameId || 'default');
    }
  };

  const loadGameData = async (latestGameId) => {
    try {
      const savedData = JSON.parse(localStorage.getItem('wigJeopardyGame'));
      if (savedData && savedData.savedGameId === latestGameId) {
        setScore(savedData.savedScore || 0);
        setAnsweredQuestions(savedData.savedAnsweredQuestions || []);
      } else {
        resetGame();
      }
      setShowStartModal(true);
    } catch (error) {
      console.error('Error loading game data:', error);
      resetGame();
    }
  };

  const saveGameData = async (updatedAnsweredQuestions, updatedScore) => {
    try {
      const gameData = {
        savedGameId: gameId,
        savedScore: updatedScore,
        savedAnsweredQuestions: updatedAnsweredQuestions,
      };
      localStorage.setItem('wigJeopardyGame', JSON.stringify(gameData));
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  };

  const resetGame = async () => {
    setScore(0);
    setAnsweredQuestions([]);
    setSelectedQuestion(null);
    setSelectedOption('');
    setSubmitted(false);
    setShowStartModal(true);
    setCouponCode(null);
    setFeedback(null);
    await saveGameData([], 0);
  };

  const handleQuestionClick = (categoryIndex, questionIndex) => {
    const question = jeopardyData.categories[categoryIndex].questions[questionIndex];
    setSelectedQuestion({ ...question, categoryIndex, questionIndex });
    setSelectedOption('');
    setSubmitted(false);
    setFeedback(null);
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSubmit = async () => {
    if (selectedQuestion) {
      const answer = {
        value: selectedQuestion.value,
        question: selectedQuestion.question,
        options: selectedQuestion.options,
        correctAnswer: selectedQuestion.correctAnswer,
        userAnswer: selectedOption,
        categoryIndex: selectedQuestion.categoryIndex,
        questionIndex: selectedQuestion.questionIndex,
      };
      const updatedAnsweredQuestions = [...answeredQuestions, answer];
      setAnsweredQuestions(updatedAnsweredQuestions);
      setSubmitted(true);
      let updatedScore = score;
      if (selectedOption === selectedQuestion.correctAnswer) {
        updatedScore = score + selectedQuestion.value;
        setScore(updatedScore);
        setFeedback({
          type: 'success',
          message: 'Correct! Discount added!',
        });
      } else {
        setFeedback({
          type: 'error',
          message: `Incorrect. The correct answer is: ${selectedQuestion.correctAnswer}`,
        });
      }
      await saveGameData(updatedAnsweredQuestions, updatedScore);
    }
  };

  const handleQuestionClose = () => {
    setSelectedQuestion(null);
    setSelectedOption('');
    setSubmitted(false);
    setFeedback(null);
  };

  const handleStartGame = () => {
    setShowStartModal(false);
  };

  const handleSnackbarClose = () => {
    setFeedback(null);
  };

  const isQuestionAnswered = (categoryIndex, questionIndex) => {
    return answeredQuestions.some((q) => q.categoryIndex === categoryIndex && q.questionIndex === questionIndex);
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: '#FFFFFF',
    boxShadow: 24,
    p: 4,
    borderRadius: 8,
    border: `2px solid #B43361`,
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#F3D4D4', minHeight: '100vh', p: 3 }}>
        <Typography variant="h6" sx={{ color: '#121212' }}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F3D4D4', minHeight: '100vh', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, color: '#B43361', textAlign: 'center' }}>
        Crown Jeopardy
      </Typography>
      <Typography variant="h6" sx={{ flexGrow: 1, color: '#121212' }}>
        Total Discount: {score}%
      </Typography>
      {couponCode && (
        <Typography variant="h6" sx={{ color: '#B43361', fontWeight: 'bold', mt: 2 }}>
          Your Coupon Code: {couponCode}
        </Typography>
      )}
      <Divider sx={{ marginTop: 2, marginBottom: 4, backgroundColor: '#B43361' }} />

      <Grid container spacing={2} justifyContent="center">
        {jeopardyData?.categories.map((category, categoryIndex) => (
          <Grid item xs={12} sm={6} md={2.4} key={category.title}>
            <Paper
              elevation={3}
              ref={(el) => (headerRefs.current[categoryIndex] = el)}
              sx={{
                bgcolor: '#B43361',
                color: '#FFFFFF',
                textAlign: 'center',
                borderRadius: '8px 8px 0 0',
                width: 150, // Match question card width
                minHeight:  80, // Minimum height for consistency
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box', // Include padding and border in width
                border: `2px solid #B43361`, // Match question card border
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  fontSize: '0.85rem', // Smaller text
                  wordBreak: 'break-word',
                  textAlign: 'center',
                  px: 1, // Padding inside Typography to avoid affecting Paper width
                }}
              >
                {category.title}
              </Typography>
            </Paper>
            {category.questions.map((question, questionIndex) => {
              const isAnswered = isQuestionAnswered(categoryIndex, questionIndex);
              return (
                <Card
                  key={`${categoryIndex}-${questionIndex}`}
                  sx={{
                    mt: 1,
                    bgcolor: isAnswered ? '#e0e0e0' : '#F3D4D4',
                    color: isAnswered ? '#121212' : '#FFFFFF', // White text for unanswered, dark for answered
                    '&:hover': !isAnswered && { bgcolor: '#FFFFFF', color: '#121212' }, // Dark text on hover for contrast
                    transition: 'background-color 0.3s, color 0.3s',
                    border: `2px solid #B43361`,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    width: 150, // Fixed width
                    height: 100, // Fixed height
                    boxSizing: 'border-box', // Include padding and border in width
                  }}
                >
                  <CardActionArea
                    onClick={() => !isAnswered && handleQuestionClick(categoryIndex, questionIndex)}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                    }}
                    disabled={isAnswered}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'inherit' }}>
                      {question.value}%
                    </Typography>
                  </CardActionArea>
                </Card>
              );
            })}
          </Grid>
        ))}
      </Grid>

      <Modal open={showStartModal} disableEscapeKeyDown>
        <Box sx={modalStyle}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#B43361' }}>
            Wig Percentage Payoff
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, color: '#121212' }}>
            Welcome to Wig Percentage Payoff! Answer questions about wigs to earn percentage points. Complete all questions to unlock a discount coupon code!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: '#121212' }}>
            Current Discount: {score}% | Questions Answered: {answeredQuestions.length}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="contained" onClick={handleStartGame}>
              {score === 0 && answeredQuestions.length === 0 ? 'Start Game' : 'Continue Game'}
            </Button>
            <Button variant="outlined" onClick={resetGame} sx={{ color: '#B43361', borderColor: '#B43361' }}>
              Reset Game
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={!!selectedQuestion} onClose={handleQuestionClose}>
        <Box sx={modalStyle}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#B43361' }}>
            {selectedQuestion?.value}% Discount
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: '#121212' }}>
            {selectedQuestion?.question}
          </Typography>
          <FormControl component="fieldset" disabled={submitted}>
            <RadioGroup value={selectedOption} onChange={handleOptionChange}>
              {selectedQuestion?.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={<Radio sx={{ color: '#B43361', '&.Mui-checked': { color: '#B43361' } }} />}
                  label={option}
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      color: submitted && option === selectedQuestion.correctAnswer ? '#121212' : '#121212',
                      fontWeight: submitted && option === selectedQuestion.correctAnswer ? 'bold' : 'normal',
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {!submitted ? (
              <Button variant="contained" onClick={handleSubmit} disabled={!selectedOption}>
                Submit
              </Button>
            ) : (
              <Button variant="contained" onClick={handleQuestionClose}>
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={!!feedback}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 1500 }}
      >
        <Alert severity={feedback?.type} sx={{ width: '100%' }}>
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WigJeopardy;