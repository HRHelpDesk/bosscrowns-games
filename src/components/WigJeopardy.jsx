import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Card, CardActionArea, Modal, Button, Divider, Radio, RadioGroup, FormControlLabel, FormControl, Snackbar, Alert, Paper } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const API_BASE_URL = 'https://bosscrowns-api-a228488a1e46.herokuapp.com/bosscrowns/jeopardy';

const WigJeopardy = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [maxHeaderHeight, setMaxHeaderHeight] = useState(60);
  const [jeopardyData, setJeopardyData] = useState(null);
  const [couponCode, setCouponCode] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const headerRefs = useRef([]);

  const MINIMUM_SCORE = 70;
  const GAME_TYPE = 'jeopardy';

  useEffect(() => {
    const fetchJeopardyData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/active?type=${GAME_TYPE}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('No active Jeopardy game found');
          }
          throw new Error(`Failed to fetch active Jeopardy game: ${response.statusText}`);
        }

        const data = await response.json();
        setJeopardyData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching active Jeopardy game:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJeopardyData();
  }, []);

  useEffect(() => {
    if (!jeopardyData || !jeopardyData.data || !jeopardyData.data.categories) return;
    const heights = headerRefs.current.map((ref) => ref?.offsetHeight || 0);
    setMaxHeaderHeight(Math.max(...heights, 60));
    const totalQuestions = jeopardyData.data.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    if (answeredQuestions.length === totalQuestions) {
      if (score >= MINIMUM_SCORE) {
        setCouponCode(jeopardyData.couponCode || `WIG${score}`);
      } else {
        setCouponCode(null);
        setFeedback({
          type: 'warning',
          message: `You need at least ${MINIMUM_SCORE}% to unlock the coupon code. Try again!`,
        });
      }
    }
  }, [jeopardyData, answeredQuestions, score]);

  const resetGame = () => {
    setScore(0);
    setAnsweredQuestions([]);
    setSelectedQuestion(null);
    setSelectedOption('');
    setSubmitted(false);
    setShowStartModal(true);
    setCouponCode(null);
    setFeedback(null);
    setCopyFeedback(null);
    headerRefs.current = [];
    setMaxHeaderHeight(60);
  };

  const handleQuestionClick = (categoryIndex, questionIndex) => {
    const question = jeopardyData.data.categories[categoryIndex].questions[questionIndex];
    setSelectedQuestion({ ...question, categoryIndex, questionIndex });
    setSelectedOption('');
    setSubmitted(false);
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedQuestion) {
      console.log('Selected Option:', selectedOption);
      console.log('Correct Answer:', selectedQuestion.correctAnswer);
      console.log('Explanation:', selectedQuestion.explanation);
      console.log('Is Correct:', selectedOption === selectedQuestion.correctAnswer);
      const answer = {
        value: selectedQuestion.value,
        question: selectedQuestion.question,
        options: selectedQuestion.options,
        correctAnswer: selectedQuestion.correctAnswer,
        explanation: selectedQuestion.explanation,
        userAnswer: selectedOption,
        categoryIndex: selectedQuestion.categoryIndex,
        questionIndex: selectedQuestion.questionIndex,
      };
      const updatedAnsweredQuestions = [...answeredQuestions, answer];
      setAnsweredQuestions(updatedAnsweredQuestions);
      setSubmitted(true);
      if (selectedOption === selectedQuestion.correctAnswer) {
        setScore(score + selectedQuestion.value);
      }
    }
  };

  const handleQuestionClose = () => {
    setTimeout(() => {
      setSelectedQuestion(null);
      setSelectedOption('');
      setSubmitted(false);
    }, 500);
  };

  const handleStartGame = () => {
    setShowStartModal(false);
  };

  const handleCopyCode = () => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode).then(() => {
        setCopyFeedback({ type: 'success', message: 'Coupon code copied to clipboard!' });
      }).catch(() => {
        setCopyFeedback({ type: 'error', message: 'Failed to copy coupon code.' });
      });
    }
  };

  const handleCopySnackbarClose = () => {
    setCopyFeedback(null);
  };

  const isQuestionAnswered = (categoryIndex, questionIndex) => {
    return answeredQuestions.some(
      (q) => q.categoryIndex === categoryIndex && q.questionIndex === questionIndex
    );
  };

  const totalQuestions = jeopardyData?.data?.categories?.reduce((sum, cat) => sum + cat.questions.length, 0) || 0;

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '85vw', sm: 500, md: 700 },
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: '#FFFFFF',
    boxShadow: 24,
    p: { xs: 2, sm: 3, md: 4 },
    borderRadius: 8,
    border: '2px solid #B43361',
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" color="#121212">Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  if (!jeopardyData || !jeopardyData.data || !jeopardyData.data.categories) {
    return (
      <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h6" color="#121212">No active Jeopardy game data available.</Typography>
      </Box>
    );
  }

  const displayedCategories = jeopardyData.data.categories.slice(0, 4) || [];

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', p: { xs: 1, sm: 2, md: 3, lg: 4 }, marginBottom:10 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          color: '#B43361',
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
        }}
      >
        Crown Jeopardy
      </Typography>
      <Typography
        variant="h6"
        sx={{ color: '#121212', textAlign: 'center', mb: 2, fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' } }}
      >
        Score: {score}% | Need {MINIMUM_SCORE}% to unlock coupon
      </Typography>
      {couponCode ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 1 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#B43361',
              fontWeight: 'bold',
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
            }}
          >
            Your Coupon Code: {couponCode}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyCode}
            sx={{
              borderColor: '#B43361',
              color: '#B43361',
              '&:hover': { borderColor: '#8B1E45', color: '#8B1E45' },
            }}
          >
            Copy
          </Button>
        </Box>
      ) : answeredQuestions.length === totalQuestions && score < MINIMUM_SCORE ? (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#B43361',
              fontWeight: 'bold',
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
            }}
          >
            Score too low! You need {MINIMUM_SCORE}% to unlock the coupon code.
          </Typography>
          <Button
            variant="contained"
            onClick={resetGame}
            sx={{
              mt: 1,
              bgcolor: '#B43361',
              '&:hover': { bgcolor: '#8B1E45' },
              fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
            }}
          >
            Reset Game
          </Button>
        </Box>
      ) : null}
      <Divider sx={{ my: 3, backgroundColor: '#B43361' }} />

      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          display: 'flex',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          gap: { xs: 0.5, sm: 1, md: 1 },
          justifyContent: 'center',
        }}
      >
        {displayedCategories.map((category, categoryIndex) => (
          <Box
            key={category.title || `category-${categoryIndex}`}
            sx={{
              flex: {
                xs: '0 0 calc(50% - 4px)',
                md: `0 0 ${100 / displayedCategories.length}%`,
              },
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Paper
              ref={(el) => (headerRefs.current[categoryIndex] = el)}
              sx={{
                bgcolor: 'linear-gradient(135deg, #B43361 0%, #8B1E45 100%)',
                color: '#FFFFFF',
                width: '100%',
                minHeight: maxHeaderHeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px 8px 0 0',
                border: '3px solid #8B1E45',
                boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
                p: 1,
                maxWidth: { xs: 200, sm: 280, md: 200, lg: 220 },
                boxSizing: 'border-box',
              }}
              aria-label={`Category: ${category.title}`}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  color: '#8B1E45',
                  fontSize: {
                    xs: 'clamp(0.7rem, 2.5vw, 0.8rem)',
                    sm: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                    md: 'clamp(0.9rem, 2.5vw, 1rem)',
                  },
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  wordBreak: 'break-word',
                }}
              >
                {category.title || ''}
              </Typography>
            </Paper>
            {category.questions.map((question, questionIndex) => {
              const isAnswered = isQuestionAnswered(categoryIndex, questionIndex);
              return (
                <Card
                  key={`${categoryIndex}-${questionIndex}`}
                  sx={{
                    mt: 1,
                    width: '100%',
                    maxWidth: { xs: 200, sm: 280, md: 200, lg: 220 },
                    height: { xs: 80, sm: 90, md: 100, lg: 120 },
                    bgcolor: isAnswered ? '#B0BEC5' : '#F3D4D4',
                    color: isAnswered ? '#121212' : '#FFFFFF',
                    border: '2px solid #B43361',
                    borderRadius: 4,
                    opacity: isAnswered ? 0.7 : 1,
                    '&:hover': !isAnswered && { bgcolor: '#FFFFFF', color: '#121212', boxShadow: '0 6px 12px rgba(0,0,0,0.2)' },
                    transition: 'all 0.3s',
                    position: 'relative',
                    '& .MuiCardActionArea-root': {
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    },
                    ...(isAnswered && {
                      '&:after': {
                        content: '"✓"',
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        color: '#121212',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                      },
                    }),
                  }}
                >
                  <CardActionArea
                    onClick={() => !isAnswered && handleQuestionClick(categoryIndex, questionIndex)}
                    disabled={isAnswered}
                    aria-label={`Question worth ${question.value}% in ${category.title || 'category'}`}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        color: isAnswered ? '#121212' : '#FFFFFF',
                        fontWeight: 'bold',
                        fontSize: {
                          xs: 'clamp(1rem, 3vw, 1.1rem)',
                          sm: 'clamp(1.2rem, 3vw, 1.3rem)',
                          md: 'clamp(1.4rem, 3vw, 1.5rem)',
                        },
                      }}
                    >
                      {question.value}
                    </Typography>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        ))}
      </Box>

      <Modal open={!!selectedQuestion} onClose={handleQuestionClose}>
        <Box sx={modalStyle}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: '#B43361',
              mb: 2,
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            }}
          >
            {selectedQuestion?.value}% Discount
          </Typography>
          <Typography
            sx={{
              mb: 3,
              color: '#121212',
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
            }}
          >
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
                      color: '#121212',
                      fontWeight: submitted && option === selectedQuestion.correctAnswer ? 'bold' : 'normal',
                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    },
                    mb: 1,
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
          {submitted && (
            <>
              <Typography
                sx={{
                  mt: 2,
                  color: selectedOption === selectedQuestion?.correctAnswer ? '#2e7d32' : '#d32f2f',
                  fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                  fontWeight: 'bold',
                }}
              >
                {selectedOption === selectedQuestion?.correctAnswer ? 'Correct!' : 'Incorrect'}
              </Typography>
              {selectedOption === selectedQuestion?.correctAnswer && selectedQuestion?.explanation && (
                <Typography
                  sx={{
                    mt: 1,
                    color: '#121212',
                    fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                    fontStyle: 'italic',
                    bgcolor: '#f5f5f5',
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  Explanation: {selectedQuestion.explanation}
                </Typography>
              )}
            </>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1.5, flexWrap: 'wrap' }}>
            {!submitted ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!selectedOption}
                sx={{
                  bgcolor: '#B43361',
                  '&:hover': { bgcolor: '#8B1E45' },
                  fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                  px: { xs: 1.5, sm: 2, md: 3 },
                }}
              >
                Submit
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleQuestionClose}
                sx={{
                  bgcolor: '#B43361',
                  '&:hover': { bgcolor: '#8B1E45' },
                  fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                  px: { xs: 1.5, sm: 2, md: 3 },
                }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={!!copyFeedback}
        autoHideDuration={2000}
        onClose={handleCopySnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={copyFeedback?.type} sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' } }}>
          {copyFeedback?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WigJeopardy;