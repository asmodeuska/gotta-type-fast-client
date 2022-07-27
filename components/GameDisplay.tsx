import React, { useEffect, useState, useRef } from 'react';
import socket from '../components/Socket';
import { Typography, FormControl, Box, TextField, Button } from '@mui/material';


interface props {
    data: string[];
    players: player[];
    roomName: string;
}

interface player {
    id: string,
    name: string,
    ready: boolean,
    progress: number
}

const GameDisplay = (props: props): JSX.Element => {

    const [isGameStarted, setIsGameStarted] = useState(false as boolean);
    const [isGameFinished, setIsGameFinished] = useState(false as boolean);
    const [countDownFinished, setCountDownFinished] = useState(false as boolean);

    const [timer, setTimer] = useState(0 as number);
    const [data, setData] = useState(props.data as string[]);
    const [countDown, setCountDown] = useState(3 as number);
    const [currentWord, setCurrentWord] = useState(props.data[0] as string);
    const [typedWord, setTypedWord] = useState('' as string);
    const [currentWordCount, setCurrentWordCount] = useState(0 as number);
    const [displayToggle, setDisplayToggle] = useState("display-none" as string);
    const [WPM, setWPM] = useState(0 as number);
    const [multiplayerReady, setMultiplayerReady] = useState(false as boolean);
    const ref = useRef<HTMLInputElement>(null);

    const updateProgress = (): void => {
        socket.emit('playerProgress', { progress: currentWordCount, roomName: props.roomName });
    }

    useEffect(() => {
        if (props.players.length > 0) {

            let allPlayerReady = true;
            props.players.forEach(player => {
                if (!player.ready) {
                    allPlayerReady = false;
                    return;
                }
            });
            console.log(allPlayerReady)
            if (allPlayerReady) {
                setMultiplayerReady(true);
            }
            else {
                setMultiplayerReady(false);
            }
        }
    }, [props.players]);

    useEffect(() => {
        if (multiplayerReady && props.players.length > 0) {
            setIsGameStarted(true);
        }
    }, [multiplayerReady, props.players.length]);

    useEffect(() => {
        setData(props.data);
    }, [props.data]);

    useEffect(() => {
        if (props.players.length > 0)
            updateProgress();
    }, [currentWordCount])

    useEffect(() => {
        if (countDownFinished && isGameStarted && timer > 0) {
            setWPM(parseInt((currentWordCount / timer * 60).toFixed(0)));
        }
        else if (!isGameStarted && !isGameFinished) {
            setWPM(0);
        }
    }, [timer, currentWordCount, isGameStarted, isGameFinished, countDownFinished]);

    useEffect(() => {
        if (countDownFinished) {
            if (ref.current !== null) {
                ref.current?.focus();
            }
        }
    }, [countDownFinished]);


    useEffect(() => {

        if (isGameStarted){
            setCurrentWordCount(0);
            setCurrentWord(data[0] + " ");
            setTimer(0);
            setWPM(0);
            setIsGameFinished(false);
            setCountDownFinished(false);
            let time = 0;
            let interval = setInterval(() => {
                if (isGameFinished) {
                    clearInterval(interval);
                    return;
                }
                else
                    setTimer(time += .1);
            }, 100);
            return () => clearInterval(interval);
        }
        
    }, [isGameStarted]);



    const startGame = async () => {
        if (!isGameStarted && !isGameFinished && props.players.length > 0) {
            socket.emit('playerReady', { roomName: props.roomName });
        }
        else if (!isGameStarted && !isGameFinished) {
            setIsGameStarted(true);
        }
        if (isGameFinished) {
            if (props.players.length > 0) {
                socket.emit('gameFinished', { roomName: props.roomName })
            }
            setIsGameStarted(true);
        }
    }

    async function generateNewText() {
        const res = await fetch('http://metaphorpsum.com/paragraphs/1/5');
        const d = await res.text();
        setData(d.split(/\s+/));
        setIsGameStarted(false);
        setCountDownFinished(false);
        setIsGameFinished(true);
    }


    const getClassName = (index: number, wordIndex: number): string => {
        if (typedWord[index] === data[wordIndex][index] && currentWordCount == wordIndex)
            return 'correct bold';
        else if (typedWord[index] !== data[wordIndex][index] && currentWordCount == wordIndex) {
            return 'selected bold';
        }
        else if (currentWordCount > wordIndex)
            return 'finished';
        else
            return '';

    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTypedWord(e.target.value);
        if (isGameStarted) {
            if (currentWord === e.target.value) {
                e.target.value = '';
                setTypedWord('');
                if (currentWordCount < data.length - 1) {
                    currentWordCount == data.length - 2 ? setCurrentWord(data[currentWordCount + 1]) : setCurrentWord(data[currentWordCount + 1] + " ");
                    setCurrentWordCount(currentWordCount + 1);
                }
                else if (currentWordCount == data.length - 1) {
                    setCurrentWordCount(currentWordCount + 1);
                    setIsGameFinished(true);
                    setIsGameStarted(false);
                    setCountDownFinished(false);
                }
            }
        }
    }


    return (
        <Box>
            <Box className={displayToggle} id="modal-countdown">
                <Typography variant='h1' id="modal-countdown-text">{countDown}</Typography>
            </Box>

            <Typography variant='h2' textAlign='center'>{WPM} WPM</Typography>
            <Box mb={1}>
                <Typography variant='h6' textAlign='center'>{timer.toFixed(1)} sec</Typography>
            </Box>

            <div className="center">
                <div id="gameDisplay">
                    {data.map((word: string, idx: number) => {
                        return (
                            <Box key={"word_" + idx}>
                                {word.split('').map((letter: string, index: number) => {
                                    return (
                                        <Box component="span" className={getClassName(index, idx)} key={index}>{letter}</Box>
                                    )
                                })
                                }&nbsp;
                            </Box>
                        )

                    }
                    )}
                </div>

            </div>
            <input autoComplete='off' ref={ref} disabled={!isGameStarted} className='input-center' value={typedWord} type="text" id="input" onChange={handleChange} />
            <Box my={1} textAlign={'center'}>
                <Box mb={0.5}>
                    <Button variant='contained' color='info' onClick={startGame}>Start</Button>
                </Box>
                {props.players.length == 0 && <Button variant='outlined' color='warning' onClick={generateNewText}>Generate new text</Button>}
            </Box>
        </Box>
    );
}


export default GameDisplay;