import React, { useState, useEffect, useRef } from 'react';

import { 
  Gamepad2, 
  RotateCcw, 
  Play, 
  AlertCircle,
  HelpCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Flame,
  Volume2
} from 'lucide-react';

// ====================================================
// SUDOKU MOCK DATA & SOLVER PRESETS
// ====================================================
interface SudokuCell {
  value: number;
  isPreset: boolean;
  isCorrect: boolean;
  userEntered: boolean;
}

const SUDOKU_PUZZLES = {
  EASY: {
    initial: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
  },
  MEDIUM: {
    initial: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0]
    ],
    solution: [
      [4, 3, 5, 2, 6, 9, 7, 8, 1],
      [6, 8, 2, 5, 7, 1, 4, 9, 3],
      [1, 9, 7, 8, 3, 4, 5, 6, 2],
      [8, 2, 6, 1, 9, 5, 3, 4, 7],
      [3, 7, 4, 6, 8, 2, 9, 1, 5],
      [9, 5, 1, 7, 4, 3, 6, 2, 8],
      [5, 1, 9, 3, 2, 6, 8, 7, 4],
      [2, 4, 8, 9, 5, 7, 1, 3, 6],
      [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ]
  }
};

// Simple web synth audio helper to create retro game sounds
const playSynthSound = (type: 'engine' | 'crash' | 'score' | 'select') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'select') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'engine') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'score') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'crash') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }
  } catch (err) {
    // Fail silently if browser blocks audio autoplay context
  }
};

export const StressReliefGames: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'sudoku' | 'car' | 'dino'>('sudoku');

  // ====================================================
  // SUDOKU GAME CODE
  // ====================================================
  const [sudokuDifficulty, setSudokuDifficulty] = useState<'EASY' | 'MEDIUM'>('EASY');
  const [sudokuBoard, setSudokuBoard] = useState<SudokuCell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [sudokuMistakes, setSudokuMistakes] = useState(0);
  const [sudokuTime, setSudokuTime] = useState(0);
  const [sudokuWin, setSudokuWin] = useState(false);
  const [sudokuLoss, setSudokuLoss] = useState(false);
  const sudokuTimerRef = useRef<any>(null);

  // Initialize Sudoku puzzle
  const initSudoku = (difficulty: 'EASY' | 'MEDIUM') => {
    const puzzle = SUDOKU_PUZZLES[difficulty];
    const newBoard = puzzle.initial.map((row, _rIdx) => 
      row.map((val, _cIdx) => ({
        value: val,
        isPreset: val !== 0,
        isCorrect: val !== 0,
        userEntered: false
      }))
    );
    setSudokuBoard(newBoard);
    setSelectedCell(null);
    setSudokuMistakes(0);
    setSudokuTime(0);
    setSudokuWin(false);
    setSudokuLoss(false);

    if (sudokuTimerRef.current) clearInterval(sudokuTimerRef.current);
    sudokuTimerRef.current = setInterval(() => {
      setSudokuTime(prev => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    if (activeGame === 'sudoku') {
      initSudoku(sudokuDifficulty);
    }
    return () => {
      if (sudokuTimerRef.current) clearInterval(sudokuTimerRef.current);
    };
  }, [activeGame, sudokuDifficulty]);

  // Handle cell numerical inputs
  const enterNumber = (num: number) => {
    if (!selectedCell || sudokuWin || sudokuLoss) return;
    const { row, col } = selectedCell;
    const cell = sudokuBoard[row][col];
    if (cell.isPreset) return;

    playSynthSound('select');
    const solution = SUDOKU_PUZZLES[sudokuDifficulty].solution;
    const correctVal = solution[row][col];

    const updatedBoard = [...sudokuBoard.map(r => r.map(c => ({ ...c })))];
    
    if (num === 0) {
      // Clear value
      updatedBoard[row][col] = {
        value: 0,
        isPreset: false,
        isCorrect: false,
        userEntered: false
      };
      setSudokuBoard(updatedBoard);
      return;
    }

    const isCorrect = num === correctVal;

    updatedBoard[row][col] = {
      value: num,
      isPreset: false,
      isCorrect,
      userEntered: true
    };

    setSudokuBoard(updatedBoard);

    if (!isCorrect) {
      const nextMistakes = sudokuMistakes + 1;
      setSudokuMistakes(nextMistakes);
      if (nextMistakes >= 3) {
        setSudokuLoss(true);
        playSynthSound('crash');
        if (sudokuTimerRef.current) clearInterval(sudokuTimerRef.current);
      }
    } else {
      // Check if board is fully complete and correct
      const isComplete = updatedBoard.every((r, rIdx) => 
        r.every((c, cIdx) => c.value === solution[rIdx][cIdx])
      );
      if (isComplete) {
        setSudokuWin(true);
        playSynthSound('score');
        if (sudokuTimerRef.current) clearInterval(sudokuTimerRef.current);
      }
    }
  };

  // Keyboard navigation for Sudoku
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeGame !== 'sudoku' || !selectedCell || sudokuWin || sudokuLoss) return;
      
      if (e.key >= '1' && e.key <= '9') {
        enterNumber(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        enterNumber(0);
      } else if (e.key === 'ArrowUp') {
        setSelectedCell(prev => prev && prev.row > 0 ? { ...prev, row: prev.row - 1 } : prev);
      } else if (e.key === 'ArrowDown') {
        setSelectedCell(prev => prev && prev.row < 8 ? { ...prev, row: prev.row + 1 } : prev);
      } else if (e.key === 'ArrowLeft') {
        setSelectedCell(prev => prev && prev.col > 0 ? { ...prev, col: prev.col - 1 } : prev);
      } else if (e.key === 'ArrowRight') {
        setSelectedCell(prev => prev && prev.col < 8 ? { ...prev, col: prev.col + 1 } : prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, sudokuBoard, sudokuDifficulty, sudokuMistakes, sudokuWin, sudokuLoss, activeGame]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };


  // ====================================================
  // RETRO CAR GAME CODE
  // ====================================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [carPlaying, setCarPlaying] = useState(false);
  const [carScore, setCarScore] = useState(0);
  const [carHighscore, setCarHighscore] = useState(() => parseInt(localStorage.getItem('nexora_car_highscore') || '0'));
  const [carGameOver, setCarGameOver] = useState(false);
  
  // Game states in refs to prevent closure delays in animation loops
  const gameLoopRef = useRef<number | null>(null);
  const carStateRef = useRef({
    playerX: 180, // Center lane
    playerY: 420,
    carWidth: 40,
    carHeight: 70,
    obstacles: [] as { x: number; y: number; width: number; height: number; speed: number; color: string }[],
    roadY: 0,
    speed: 4,
    score: 0,
    gameOver: false,
    keys: { Left: false, Right: false }
  });

  const resetCarGame = () => {
    carStateRef.current = {
      playerX: 180,
      playerY: 420,
      carWidth: 40,
      carHeight: 70,
      obstacles: [],
      roadY: 0,
      speed: 4,
      score: 0,
      gameOver: false,
      keys: { Left: false, Right: false }
    };
    setCarScore(0);
    setCarGameOver(false);
    setCarPlaying(true);
  };

  // Keyboard hooks for car controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeGame !== 'car') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        carStateRef.current.keys.Left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        carStateRef.current.keys.Right = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (activeGame !== 'car') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        carStateRef.current.keys.Left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        carStateRef.current.keys.Right = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeGame]);

  // Main canvas animation loop
  useEffect(() => {
    if (activeGame !== 'car' || !carPlaying || carGameOver) {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let obstacleTimer = 0;

    const gameLoop = () => {
      const state = carStateRef.current;
      if (state.gameOver) {
        setCarGameOver(true);
        setCarPlaying(false);
        playSynthSound('crash');
        if (state.score > carHighscore) {
          setCarHighscore(state.score);
          localStorage.setItem('nexora_car_highscore', String(state.score));
        }
        return;
      }

      // 1. UPDATE STATES
      // Player movement
      if (state.keys.Left && state.playerX > 40) {
        state.playerX -= 5;
      }
      if (state.keys.Right && state.playerX < 320) {
        state.playerX += 5;
      }

      // Scroll road markings
      state.roadY = (state.roadY + state.speed) % 80;

      // Spawn obstacles (Every 100 frames)
      obstacleTimer++;
      if (obstacleTimer > 90 - Math.min(state.speed * 4, 50)) {
        obstacleTimer = 0;
        const lanes = [55, 135, 215, 295];
        const randomLane = lanes[Math.floor(Math.random() * lanes.length)];
        const obstacleColors = ['#EF4444', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'];
        const randomColor = obstacleColors[Math.floor(Math.random() * obstacleColors.length)];
        
        state.obstacles.push({
          x: randomLane,
          y: -80,
          width: 38,
          height: 68,
          speed: state.speed + Math.random() * 2,
          color: randomColor
        });
      }

      // Move & filter obstacles
      state.obstacles = state.obstacles.filter(obs => {
        obs.y += obs.speed;

        // Collision detection box
        const hitPlayer = 
          state.playerX < obs.x + obs.width &&
          state.playerX + state.carWidth > obs.x &&
          state.playerY < obs.y + obs.height &&
          state.playerY + state.carHeight > obs.y;

        if (hitPlayer) {
          state.gameOver = true;
        }

        // Passed bottom
        if (obs.y > 520) {
          state.score += 10;
          setCarScore(state.score);
          playSynthSound('score');
          
          // Speed up slowly
          if (state.score % 50 === 0) {
            state.speed += 0.5;
          }
          return false;
        }
        return true;
      });

      // 2. DRAW GRAPHICS
      // Clear canvas (Dark road background)
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw green grass shoulders
      ctx.fillStyle = '#065F46';
      ctx.fillRect(0, 0, 30, canvas.height);
      ctx.fillRect(370, 0, 30, canvas.height);

      // Draw red-white curbstones striping
      const curbSize = 40;
      for (let y = -curbSize; y < canvas.height + curbSize; y += curbSize) {
        const drawY = y + (state.roadY % curbSize);
        ctx.fillStyle = Math.floor(y / curbSize) % 2 === 0 ? '#EF4444' : '#FFFFFF';
        ctx.fillRect(25, drawY, 5, curbSize);
        ctx.fillRect(370, drawY, 5, curbSize);
      }

      // Draw Lane dash lines (Yellow)
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 4;
      ctx.setLineDash([25, 30]);
      
      // Lane dividers
      const lanesX = [120, 200, 280];
      lanesX.forEach(lx => {
        ctx.beginPath();
        ctx.moveTo(lx, -80 + (state.roadY % 55));
        ctx.lineTo(lx, canvas.height + 80);
        ctx.stroke();
      });
      ctx.setLineDash([]); // Reset line dash

      // Draw player car (Electric neon blue sporty car)
      ctx.fillStyle = '#06B6D4'; // Brand electric cyan
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 12;
      
      // Car chassis body
      ctx.fillRect(state.playerX, state.playerY + 10, state.carWidth, state.carHeight - 20);
      // Wheels
      ctx.fillStyle = '#0F172A';
      ctx.shadowBlur = 0; // Disable shadow for wheels
      ctx.fillRect(state.playerX - 3, state.playerY + 15, 4, 12);
      ctx.fillRect(state.playerX + state.carWidth - 1, state.playerY + 15, 4, 12);
      ctx.fillRect(state.playerX - 3, state.playerY + 50, 4, 12);
      ctx.fillRect(state.playerX + state.carWidth - 1, state.playerY + 50, 4, 12);

      // Cabin windshield/glass
      ctx.fillStyle = '#0891B2';
      ctx.fillRect(state.playerX + 5, state.playerY + 28, state.carWidth - 10, 22);

      // Headlights (Yellow glow)
      ctx.fillStyle = '#FFF';
      ctx.fillRect(state.playerX + 5, state.playerY + 8, 6, 4);
      ctx.fillRect(state.playerX + state.carWidth - 11, state.playerY + 8, 6, 4);
      
      // Draw obstacle cars
      state.obstacles.forEach(obs => {
        // Body
        ctx.fillStyle = obs.color;
        ctx.shadowColor = obs.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(obs.x, obs.y + 10, obs.width, obs.height - 20);

        // Wheels
        ctx.fillStyle = '#000';
        ctx.shadowBlur = 0;
        ctx.fillRect(obs.x - 3, obs.y + 15, 4, 12);
        ctx.fillRect(obs.x + obs.width - 1, obs.y + 15, 4, 12);
        ctx.fillRect(obs.x - 3, obs.y + 48, 4, 12);
        ctx.fillRect(obs.x + obs.width - 1, obs.y + 48, 4, 12);

        // Glass cabin
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(obs.x + 5, obs.y + 25, obs.width - 10, 20);
      });

      // Clear shadow properties
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [activeGame, carPlaying, carGameOver]);

  const pressLeft = () => {
    carStateRef.current.playerX = Math.max(40, carStateRef.current.playerX - 25);
    playSynthSound('engine');
  };

  const pressRight = () => {
    carStateRef.current.playerX = Math.min(320, carStateRef.current.playerX + 25);
    playSynthSound('engine');
  };

  // ====================================================
  // DINO GAME CODE
  // ====================================================
  const dinoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dinoPlaying, setDinoPlaying] = useState(false);
  const [dinoScore, setDinoScore] = useState(0);
  const [dinoHighscore, setDinoHighscore] = useState(() => parseInt(localStorage.getItem('nexora_dino_highscore') || '0'));
  const [dinoGameOver, setDinoGameOver] = useState(false);

  const dinoLoopRef = useRef<number | null>(null);
  const dinoStateRef = useRef({
    dinoY: 200,
    dinoVy: 0,
    dinoWidth: 26,
    dinoHeight: 36,
    gravity: 0.6,
    jumpForce: -9.0,
    isJumping: false,
    obstacles: [] as { x: number; y: number; width: number; height: number; speed: number }[],
    clouds: [] as { x: number; y: number; width: number; speed: number }[],
    groundX: 0,
    speed: 3.5,
    score: 0,
    gameOver: false
  });

  const resetDinoGame = () => {
    dinoStateRef.current = {
      dinoY: 200,
      dinoVy: 0,
      dinoWidth: 26,
      dinoHeight: 36,
      gravity: 0.6,
      jumpForce: -9.0,
      isJumping: false,
      obstacles: [],
      clouds: [
        { x: 100, y: 50, width: 40, speed: 0.5 },
        { x: 300, y: 70, width: 30, speed: 0.3 },
        { x: 450, y: 40, width: 50, speed: 0.4 }
      ],
      groundX: 0,
      speed: 3.5,
      score: 0,
      gameOver: false
    };
    setDinoScore(0);
    setDinoGameOver(false);
    setDinoPlaying(true);
  };

  const triggerDinoJump = () => {
    const s = dinoStateRef.current;
    if (s.gameOver || !dinoPlaying) return;
    if (!s.isJumping) {
      s.dinoVy = s.jumpForce;
      s.isJumping = true;
      playSynthSound('engine');
    }
  };

  // Keyboard handle for jumps
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeGame !== 'dino') return;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        triggerDinoJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGame, dinoPlaying, dinoGameOver]);

  // Dino Game Animation Loop
  useEffect(() => {
    if (activeGame !== 'dino' || !dinoPlaying || dinoGameOver) {
      if (dinoLoopRef.current) cancelAnimationFrame(dinoLoopRef.current);
      return;
    }

    const canvas = dinoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let obstacleTimer = 0;

    const loop = () => {
      const s = dinoStateRef.current;
      if (s.gameOver) {
        setDinoGameOver(true);
        setDinoPlaying(false);
        playSynthSound('crash');
        if (s.score > dinoHighscore) {
          setDinoHighscore(s.score);
          localStorage.setItem('nexora_dino_highscore', String(s.score));
        }
        return;
      }

      // 1. UPDATE STATES
      s.dinoVy += s.gravity;
      s.dinoY += s.dinoVy;

      if (s.dinoY >= 200) {
        s.dinoY = 200;
        s.dinoVy = 0;
        s.isJumping = false;
      }

      s.groundX = (s.groundX - s.speed) % 500;

      obstacleTimer++;
      if (obstacleTimer > 100 - Math.min(s.speed * 3, 60)) {
        obstacleTimer = 0;
        const heights = [20, 30, 40];
        const randomHeight = heights[Math.floor(Math.random() * heights.length)];
        s.obstacles.push({
          x: 520,
          y: 236 - randomHeight,
          width: 14 + Math.random() * 8,
          height: randomHeight,
          speed: s.speed
        });
      }

      s.obstacles = s.obstacles.filter(obs => {
        obs.x -= obs.speed;

        const hit = 
          60 < obs.x + obs.width &&
          60 + s.dinoWidth > obs.x &&
          s.dinoY < obs.y + obs.height &&
          s.dinoY + s.dinoHeight > obs.y;

        if (hit) {
          s.gameOver = true;
        }

        if (obs.x < -30) {
          s.score += 5;
          setDinoScore(s.score);
          playSynthSound('score');
          if (s.score % 50 === 0) {
            s.speed += 0.2;
          }
          return false;
        }
        return true;
      });

      s.clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x < -c.width) {
          c.x = 520;
          c.y = 30 + Math.random() * 50;
        }
      });

      // 2. DRAW GRAPHICS
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      s.clouds.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.width / 2, 0, Math.PI * 2);
        ctx.arc(c.x + c.width * 0.4, c.y + c.width * 0.1, c.width * 0.4, 0, Math.PI * 2);
        ctx.arc(c.x - c.width * 0.4, c.y + c.width * 0.1, c.width * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 236);
      ctx.lineTo(canvas.width, 236);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      for (let x = s.groundX; x < canvas.width + 50; x += 30) {
        ctx.fillRect(x, 240, 4, 2);
        ctx.fillRect(x + 15, 246, 2, 2);
      }

      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 10;
      ctx.fillRect(72, s.dinoY, 14, 12);
      ctx.fillRect(70, s.dinoY + 4, 18, 8);
      ctx.fillStyle = '#000';
      ctx.fillRect(80, s.dinoY + 2, 2, 2);
      ctx.fillStyle = '#10B981';
      ctx.fillRect(60, s.dinoY + 12, 18, 16);
      ctx.fillRect(56, s.dinoY + 14, 6, 8);
      ctx.fillStyle = '#10B981';
      const step = Math.floor(s.score / 5) % 2 === 0;
      ctx.fillRect(62, s.dinoY + 28, 4, step ? 8 : 4);
      ctx.fillRect(70, s.dinoY + 28, 4, step ? 4 : 8);

      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 8;
      s.obstacles.forEach(obs => {
        ctx.fillRect(obs.x + obs.width / 2 - 3, obs.y, 6, obs.height);
        ctx.fillRect(obs.x, obs.y + obs.height * 0.3, obs.width / 2 - 3, 5);
        ctx.fillRect(obs.x, obs.y + obs.height * 0.15, 4, obs.height * 0.2);
        ctx.fillRect(obs.x + obs.width / 2 + 1, obs.y + obs.height * 0.4, obs.width / 2 - 3, 5);
        ctx.fillRect(obs.x + obs.width - 4, obs.y + obs.height * 0.25, 4, obs.height * 0.2);
      });

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      dinoLoopRef.current = requestAnimationFrame(loop);
    };

    dinoLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if (dinoLoopRef.current) cancelAnimationFrame(dinoLoopRef.current);
    };
  }, [activeGame, dinoPlaying, dinoGameOver]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-slide-up">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center">
            <Gamepad2 size={24} className="mr-2 text-nexora-blue dark:text-nexora-electric animate-bounce" />
            Nexora Stress-Relief Zone
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Reduce stress during work breaks with simple wellness games. Sound effects are fully synthesized in real-time!
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex space-x-2 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 w-max">
          <button
            onClick={() => {
              setActiveGame('sudoku');
              playSynthSound('select');
            }}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all ${
              activeGame === 'sudoku'
                ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Wellness Sudoku
          </button>
          <button
            onClick={() => {
              setActiveGame('car');
              playSynthSound('select');
            }}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all ${
              activeGame === 'car'
                ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Retro Car Racer
          </button>
          <button
            onClick={() => {
              setActiveGame('dino');
              playSynthSound('select');
            }}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all ${
              activeGame === 'dino'
                ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Offline Dino Run
          </button>
        </div>
      </div>

      {/* ====================================================
          GAME CONTAINER: WELLNESS SUDOKU
          ==================================================== */}
      {activeGame === 'sudoku' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Sudoku grid sheet (2/3 col on large screens) */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow space-y-4">
            
            {/* Status bar */}
            <div className="flex justify-between items-center text-xs border-b pb-3 border-slate-100 dark:border-slate-800 font-semibold">
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-350">
                <span>Mistakes: <strong className={sudokuMistakes > 0 ? 'text-red-500' : 'text-slate-800 dark:text-white'}>{sudokuMistakes}/3</strong></span>
                <span>•</span>
                <span>Time: <strong className="font-mono text-slate-800 dark:text-white">{formatTime(sudokuTime)}</strong></span>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={sudokuDifficulty}
                  onChange={(e) => setSudokuDifficulty(e.target.value as any)}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold rounded border-none text-slate-700 dark:text-slate-300"
                >
                  <option value="EASY">Easy Board</option>
                  <option value="MEDIUM">Medium Board</option>
                </select>
                <button
                  onClick={() => initSudoku(sudokuDifficulty)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded"
                  title="Reset Game"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Game Screen Layout */}
            <div className="relative flex justify-center">
              
              {/* Sudoku Grid */}
              <div className="grid grid-cols-9 border-2 border-slate-900 dark:border-slate-500 w-max max-w-full overflow-hidden bg-slate-900/10 gap-[1px]">
                {sudokuBoard.map((row, rIdx) => 
                  row.map((cell, cIdx) => {
                    const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx;
                    
                    // Style cell borders for 3x3 grids
                    const borderBottom = (rIdx === 2 || rIdx === 5) ? 'border-b-2 border-slate-900 dark:border-slate-500' : '';
                    const borderRight = (cIdx === 2 || cIdx === 5) ? 'border-r-2 border-slate-900 dark:border-slate-500' : '';

                    let cellBg = 'bg-white dark:bg-slate-900/60';
                    if (isSelected) {
                      cellBg = 'bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100';
                    } else if (selectedCell && (selectedCell.row === rIdx || selectedCell.col === cIdx)) {
                      // Highlight same row/col slightly
                      cellBg = 'bg-slate-50 dark:bg-slate-850/40';
                    }

                    let textColor = 'text-slate-900 dark:text-white';
                    if (cell.userEntered) {
                      textColor = cell.isCorrect 
                        ? 'text-blue-600 dark:text-blue-400 font-extrabold' 
                        : 'text-red-500 dark:text-red-400 font-extrabold';
                    } else if (cell.isPreset) {
                      textColor = 'text-slate-500 dark:text-slate-400 font-bold';
                    }

                    return (
                      <button
                        key={`${rIdx}-${cIdx}`}
                        onClick={() => setSelectedCell({ row: rIdx, col: cIdx })}
                        className={`w-9 h-9 md:w-11 md:h-11 flex items-center justify-center text-xs md:text-sm transition-all focus:outline-none ${cellBg} ${borderBottom} ${borderRight} ${textColor}`}
                      >
                        {cell.value !== 0 ? cell.value : ''}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Game Over Screen Overlay */}
              {sudokuLoss && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col justify-center items-center text-center p-6 text-white rounded-lg animate-fade-in">
                  <AlertCircle className="w-10 h-10 text-red-500 mb-2 animate-bounce" />
                  <h3 className="text-sm font-extrabold font-heading uppercase tracking-widest text-red-500">Strikes Limit Exceeded!</h3>
                  <p className="text-xs text-slate-350 max-w-xs mt-1">You made 3 incorrect entries. Re-attempt to clear stress.</p>
                  <button
                    onClick={() => initSudoku(sudokuDifficulty)}
                    className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center shadow active:scale-95 transition-all"
                  >
                    <RotateCcw size={12} className="mr-1.5" /> Restart Puzzle
                  </button>
                </div>
              )}

              {/* Win Overlay */}
              {sudokuWin && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col justify-center items-center text-center p-6 text-white rounded-lg animate-fade-in">
                  <Check className="w-10 h-10 text-green-500 mb-2 animate-bounce" />
                  <h3 className="text-sm font-extrabold font-heading uppercase tracking-widest text-green-400">Puzzle Cleared Successfully!</h3>
                  <p className="text-xs text-slate-350 max-w-xs mt-1">Great job! You cleared the board in {formatTime(sudokuTime)}.</p>
                  <button
                    onClick={() => initSudoku(sudokuDifficulty)}
                    className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg flex items-center shadow active:scale-95 transition-all"
                  >
                    <RotateCcw size={12} className="mr-1.5" /> Play Again
                  </button>
                </div>
              )}

            </div>

            {/* Input keypad */}
            <div className="pt-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-center mb-2.5">Input Number Pad</span>
              <div className="flex justify-center gap-2 max-w-sm mx-auto flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => enterNumber(num)}
                    disabled={!selectedCell || sudokuBoard[selectedCell.row][selectedCell.col]?.isPreset}
                    className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white rounded-lg transition-colors border border-slate-200/50 dark:border-slate-700"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => enterNumber(0)}
                  disabled={!selectedCell || sudokuBoard[selectedCell.row][selectedCell.col]?.isPreset}
                  className="w-16 h-10 md:h-12 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-40 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

          </div>

          {/* Guidelines info card (1/3 col on large screens) */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-850">
              Wellness Benefits
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              Sudoku shifts focus away from coding challenges, exercising cognitive functions in a structured way that resets active memory.
            </p>
            
            <div className="pt-2 space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">How to Play:</h4>
              <ul className="list-disc pl-4 text-[10px] text-slate-450 space-y-1 font-sans">
                <li>Select a cell, then press numbers 1-9 on your keypad or keyboard.</li>
                <li>Each row, column, and 3x3 block must contain numbers 1-9 once.</li>
                <li>Make less than 3 mistakes to win the round.</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-[10px] text-slate-400">
              <HelpCircle size={14} />
              <span>Keyboard support enabled. Use arrow keys to navigate grid.</span>
            </div>
          </div>

        </div>
      )}

      {/* ====================================================
          GAME CONTAINER: RETRO CAR RACER
          ==================================================== */}
      {activeGame === 'car' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Canvas container (2/3 col on large screens) */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex flex-col items-center">
            
            {/* Top Score bar */}
            <div className="w-full flex justify-between items-center text-xs border-b pb-3 border-slate-100 dark:border-slate-800 font-semibold mb-4 px-2">
              <div className="flex items-center space-x-4">
                <span>Score: <strong className="text-nexora-blue dark:text-nexora-electric text-sm font-bold font-mono">{carScore}</strong></span>
                <span>High Score: <strong className="text-slate-800 dark:text-white text-sm font-bold font-mono">{carHighscore}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-extrabold uppercase flex items-center">
                  <Flame size={12} className="mr-1 animate-pulse" /> Speed: {carStateRef.current.speed.toFixed(1)}
                </span>
                <button
                  onClick={resetCarGame}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded"
                  title="Reset Game"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Canvas Game Area */}
            <div className="relative border-4 border-slate-900 dark:border-slate-650 rounded-lg overflow-hidden w-[400px] h-[500px] max-w-full shadow-2xl">
              <canvas
                ref={canvasRef}
                width={400}
                height={500}
                className="bg-slate-800 block w-full h-full"
              />

              {/* Start Screen Overlay */}
              {!carPlaying && !carGameOver && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col justify-center items-center text-center p-6 text-white animate-fade-in">
                  <Gamepad2 className="w-12 h-12 text-nexora-electric mb-3 animate-bounce" />
                  <h3 className="text-base font-extrabold font-heading uppercase tracking-widest text-nexora-electric">Retro Highway Racer</h3>
                  <p className="text-xs text-slate-350 max-w-xs mt-1.5 leading-relaxed font-sans">
                    Dodge incoming traffic. Use left/right arrow keys to steer. Clear obstacles to gain points!
                  </p>
                  <button
                    onClick={resetCarGame}
                    className="mt-5 px-6 py-2.5 bg-nexora-blue hover:bg-nexora-blue/90 text-white text-xs font-semibold rounded-lg flex items-center shadow-lg active:scale-95 transition-all"
                  >
                    <Play size={14} className="mr-1.5" /> Start Racing
                  </button>
                </div>
              )}

              {/* Game Over Screen Overlay */}
              {carGameOver && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col justify-center items-center text-center p-6 text-white animate-fade-in">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-3 animate-pulse" />
                  <h3 className="text-base font-extrabold font-heading uppercase tracking-widest text-red-500">Highway Crash!</h3>
                  <p className="text-xs text-slate-350 mt-1">Final Score: <strong className="text-white text-sm font-mono">{carScore}</strong></p>
                  <button
                    onClick={resetCarGame}
                    className="mt-5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center shadow-md active:scale-95 transition-all"
                  >
                    <RotateCcw size={12} className="mr-1.5" /> Restart Game
                  </button>
                </div>
              )}
            </div>

            {/* Mobile/Accessibility touch controls */}
            <div className="mt-4 flex gap-4 w-full justify-center max-w-xs">
              <button
                onClick={pressLeft}
                disabled={!carPlaying}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-900 dark:text-white rounded-lg flex justify-center items-center border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 transition-all"
              >
                <ChevronLeft size={20} /> Steer Left
              </button>
              <button
                onClick={pressRight}
                disabled={!carPlaying}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-900 dark:text-white rounded-lg flex justify-center items-center border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 transition-all"
              >
                Steer Right <ChevronRight size={20} />
              </button>
            </div>

          </div>

          {/* Right rules card (1/3 col on large screens) */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-850">
              Arcade Controls
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              The Retro Highway Racer improves visual reaction timing and triggers dopamine release, perfect for clearing mental fatigue between intense coding sprints.
            </p>

            <div className="pt-2 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keyboard Bindings:</h4>
              <ul className="list-disc pl-4 text-[10px] text-slate-450 space-y-1 font-sans">
                <li><strong className="text-slate-700 dark:text-slate-300">Left Arrow</strong> or <strong className="text-slate-700 dark:text-slate-300">A</strong>: Steer Left</li>
                <li><strong className="text-slate-700 dark:text-slate-300">Right Arrow</strong> or <strong className="text-slate-700 dark:text-slate-300">D</strong>: Steer Right</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-[10px] text-slate-400">
              <Volume2 size={14} className="text-slate-400" />
              <span>Real-time synthesized 8-bit sound effects. Make sure volume is on!</span>
            </div>
          </div>

        </div>
      )}

      {/* ====================================================
          GAME CONTAINER: CHROME DINO RUNNER
          ==================================================== */}
      {activeGame === 'dino' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Canvas container (2/3 col on large screens) */}
          <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow flex flex-col items-center">
            
            {/* Top Score bar */}
            <div className="w-full flex justify-between items-center text-xs border-b pb-3 border-slate-100 dark:border-slate-800 font-semibold mb-4 px-2">
              <div className="flex items-center space-x-4">
                <span>Score: <strong className="text-nexora-blue dark:text-nexora-electric text-sm font-bold font-mono">{dinoScore}</strong></span>
                <span>High Score: <strong className="text-slate-800 dark:text-white text-sm font-bold font-mono">{dinoHighscore}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-extrabold uppercase flex items-center">
                  Speed: {dinoStateRef.current.speed.toFixed(1)}
                </span>
                <button
                  onClick={resetDinoGame}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded"
                  title="Reset Game"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Canvas Game Area */}
            <div className="relative border-4 border-slate-900 dark:border-slate-650 rounded-lg overflow-hidden w-[500px] h-[300px] max-w-full shadow-2xl">
              <canvas
                ref={dinoCanvasRef}
                width={500}
                height={300}
                className="bg-slate-900 block w-full h-full"
              />

              {/* Start Screen Overlay */}
              {!dinoPlaying && !dinoGameOver && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col justify-center items-center text-center p-6 text-white animate-fade-in">
                  <Gamepad2 className="w-12 h-12 text-emerald-450 mb-3 animate-bounce" />
                  <h3 className="text-base font-extrabold font-heading uppercase tracking-widest text-emerald-400">Offline Dino Runner</h3>
                  <p className="text-xs text-slate-350 max-w-xs mt-1.5 leading-relaxed font-sans">
                    Jump over obstacles! Use Spacebar, Up Arrow, or click jump button to play.
                  </p>
                  <button
                    onClick={resetDinoGame}
                    className="mt-5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center shadow-lg active:scale-95 transition-all"
                  >
                    <Play size={14} className="mr-1.5" /> Start Running
                  </button>
                </div>
              )}

              {/* Game Over Screen Overlay */}
              {dinoGameOver && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col justify-center items-center text-center p-6 text-white animate-fade-in">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-3 animate-pulse" />
                  <h3 className="text-base font-extrabold font-heading uppercase tracking-widest text-red-500">Game Over</h3>
                  <p className="text-xs text-slate-350 mt-1">Final Score: <strong className="text-white text-sm font-mono">{dinoScore}</strong></p>
                  <button
                    onClick={resetDinoGame}
                    className="mt-5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center shadow-md active:scale-95 transition-all"
                  >
                    <RotateCcw size={12} className="mr-1.5" /> Run Again
                  </button>
                </div>
              )}
            </div>

            {/* Jump touch controls */}
            <div className="mt-4 w-full max-w-xs">
              <button
                onClick={triggerDinoJump}
                disabled={!dinoPlaying}
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-900 dark:text-white rounded-lg flex justify-center items-center border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 transition-all font-bold text-xs"
              >
                Press Space / Click to JUMP!
              </button>
            </div>

          </div>

          {/* Right rules card (1/3 col on large screens) */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-dark-border premium-shadow space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b pb-2 border-slate-100 dark:border-slate-850">
              Dino Runner Info
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              The Chrome Dino Offline jump runner simulates retro 8-bit game mechanics, triggering simple focus states that calm active stress patterns.
            </p>

            <div className="pt-2 space-y-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keyboard Bindings:</h4>
              <ul className="list-disc pl-4 text-[10px] text-slate-450 space-y-1 font-sans">
                <li><strong className="text-slate-700 dark:text-slate-300">Spacebar</strong> or <strong className="text-slate-700 dark:text-slate-300">Up Arrow</strong>: JUMP</li>
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-[10px] text-slate-400">
              <Volume2 size={14} className="text-slate-400" />
              <span>Real-time synthesized 8-bit sound effects. Make sure volume is on!</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
