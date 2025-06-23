import React, { useState, useRef, useEffect } from 'react';

const paragraphsList = [
  "Typing is a valuable skill that improves with consistent practice.Education is the foundation of personal and societal growth. It equips individuals with knowledge, critical thinking skills, and the confidence to face life’s challenges. A strong education system not only promotes equality but also shapes the future by empowering the next generation of leaders, thinkers, and creators.",
  "It allows individuals to communicate quickly and efficiently, whether they're writing emails, coding, or creating content.The health of our planet is crucial for the well-being of future generations. Climate change, deforestation, and pollution are pressing issues that demand urgent action. Sustainable living, renewable energy, and conservation efforts are essential steps toward preserving the environment and creating a healthier planet for all.",
  "A fast and accurate typist can save a significant amount of time and reduce errors.Technology has transformed the way we live, work, and communicate. From smartphones to artificial intelligence, advancements in technology have improved efficiency and opened new opportunities across all sectors. Innovation continues to drive progress, making the world more connected and accessible than ever before."
];

const getRandomParagraph = () => {
  const index = Math.floor(Math.random() * paragraphsList.length);
  return paragraphsList[index];
};

function Typing_test() {
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [charStatus, setCharStatus] = useState([]);
  const [accuracy, setAccuracy] = useState(100);
  const [strictMode, setStrictMode] = useState(true);
  const [cps, setCps] = useState(0);
  const intervalRef = useRef(null);
  const inputRef = useRef(null);
  const [paragraphText, setParagraphText] = useState(getRandomParagraph());

  const soundCorrectRef = useRef(null);
  const soundInCorrectRef = useRef(null);

  useEffect(() => {
    if (started && timer === 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [started]);

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const calculateStats = (correct, totalTyped) => {
    const minutes = timer / 60 || 1 / 60;
    const seconds = timer || 1;
    const newWpm = Math.round((correct / 5) / minutes);
    const newAccuracy = Math.round((correct / totalTyped) * 100) || 0;
    const newCps = Math.round(totalTyped / seconds);
    setWpm(newWpm);
    setAccuracy(newAccuracy);
    setCps(newCps);
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setInput(value);
    if (!started) setStarted(true);

    let correct = 0;
    let newStates = [];

    for (let i = 0; i < value.length; i++) {
      if (value[i] === paragraphText[i]) {
        correct++;
        if (charStatus[i] !== 'correct') soundCorrectRef.current?.play();
        newStates.push('correct');
      } else {
        if (charStatus[i] !== 'incorrect') soundInCorrectRef.current?.play();
        newStates.push('incorrect');
      }
    }

    setCharStatus(newStates);
    calculateStats(correct, value.length);

    if (value.length >= paragraphText.length) {
      stopTimer();
      if (inputRef.current) inputRef.current.disabled = true;
    }
  };

  const handleKeyDown = (e) => {
    if (
      strictMode &&
      (e.key === 'Backspace' || e.key === 'Delete') &&
      charStatus.length !== paragraphText.length
    ) {
      e.preventDefault();
    }
  };

  const restart = () => {
    setInput('');
    setTimer(0);
    setWpm(0);
    setAccuracy(100);
    setStarted(false);
    setCharStatus([]);
    setParagraphText(getRandomParagraph());
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (inputRef.current) {
      inputRef.current.disabled = false;
      inputRef.current.focus();
    }
  };

  return (
    <div className='container'>
      <h1 className='typing-heading'>Typing Speed Test</h1>

      <p id="text-display">
        {[...paragraphText].map((char, i) => {
          const className = charStatus[i];
          return (
            <span key={i} className={className}>
              {char}
            </span>
          );
        })}
      </p>

      <textarea
        id="input-area"
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        placeholder="Start Typing"
      ></textarea>

      {/* Stats Row */}
      <div className='stat-boxes'>
        <div className='stat-box'>
          <div className='stat-label speed-label'>Speed</div>
          <div className='stat-value speed-value'>{cps}</div>
          <div className='stat-unit'>CPS</div>
        </div>
        <div className='stat-box'>
          <div className='stat-label accuracy-label'>Accuracy</div>
          <div className='stat-value accuracy-value'>{accuracy}%</div>
        </div>
        <div className='stat-box'>
          <div className='stat-label wpm-label'>WPM</div>
          <div className='stat-value wpm-value'>{wpm}</div>
        </div>
      </div>

      {/* Buttons */}
      <div className='action-button-row'>
        <div className='time-button'>
          ⏰ Time: <span id="timer">{timer}</span> s
        </div>
        <button
          id="restart"
          onClick={restart}
          className='action-button restart-button'
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Restart
        </button>
        <button
          id="mode"
          className={`action-button mode-button ${strictMode ? 'red-mode' : 'green-mode'}`}
          onClick={() => setStrictMode(!strictMode)}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {strictMode ? 'Strict Mode' : 'Free Mode'}
        </button>
      </div>

      <audio id="correct-sound" ref={soundCorrectRef} src="/sounds/correct.mp3" preload="auto"></audio>
      <audio id="wrong-sound" ref={soundInCorrectRef} src="/sounds/wrong.mp3" preload="auto"></audio>
    </div>
  );
}

export default Typing_test;
