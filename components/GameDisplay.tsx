import React, { useEffect, useState, useRef } from 'react';
import socket from '../components/Socket';
import { Typography, FormControl, Box, TextField, Button } from '@mui/material';
import { Howl, Howler } from 'howler';
import KeyboardSound from '../components/KeyboardSound';

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

    const [WPM, setWPM] = useState(0 as number);
    const [timer, setTimer] = useState(0.01 as number);
    const [generatedWords, setGeneratedWords] = useState(props.data as string[]);
    const [indexOfGeneratedWords, setIndexOfGeneratedWords] = useState(0 as number);
    const [multiplayerReady, setMultiplayerReady] = useState(false as boolean);
    const [indexOfWord, setIndexOfWord] = useState(0 as number);
    const [isGameStarted, setIsGameStarted] = useState(false as boolean);
    const [isGameFinished, setIsGameFinished] = useState(false as boolean);
    const [inputValue, setInputValue] = useState('' as string);
    const inputRef = useRef<HTMLInputElement>(null);
    const keybodardSoundRef = useRef<any>(null);

    const updateProgress = (): void => {
        socket.emit('playerProgress', { progress: indexOfGeneratedWords, roomName: props.roomName });
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
        if (isGameStarted) {                
            setWPM(parseInt(((indexOfGeneratedWords / timer) * 60).toFixed(0)));
        }
    }, [multiplayerReady, isGameStarted, timer, isGameStarted]);

    useEffect(() => {
        if (props.players.length > 0) {
            updateProgress();
        }
    }, [indexOfGeneratedWords]);


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
        const res = await fetch(process.env.NEXT_PUBLIC_SOCKET_IO +'/generate');
        const d = await res.text();
        setGeneratedWords(d.split(/\s+/));
        setIsGameStarted(false);
        setIsGameFinished(false);
        setInputValue('');
    }

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined = undefined;

        const startTimer = () => {
            intervalId = setInterval(() => {
                setTimer(prevTimer => prevTimer + 0.1);
            }, 100);
        };

        const stopTimer = () => {
            clearInterval(intervalId);
        };

        if (isGameStarted && !isGameFinished) {
            startTimer();
            inputRef.current?.focus();
        } else if (isGameStarted && isGameFinished) {
            stopTimer();
        }

        return () => {
            stopTimer();
        };
    }, [isGameStarted, isGameFinished]);


    const onInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
        let input = e.target.value;
        if (indexOfGeneratedWords === generatedWords.length - 1 && input === generatedWords[indexOfGeneratedWords]) {
            setIsGameFinished(true);
        }
        else if (input[input.length - 1] === ' ' && input.length > 0) {
            input = input.trim();
            if (input == generatedWords[indexOfGeneratedWords]) {
                setIndexOfGeneratedWords(indexOfGeneratedWords + 1);
                input = '';
                setIndexOfWord(0);
            }
        }
        else if (input.length > 0) {
            if (input === generatedWords[indexOfGeneratedWords].slice(0, input.length)) {
                setIndexOfWord(input.length);
            }
        }
        setInputValue(input);
        keybodardSoundRef.current?.play();
    }


    const getWordLetterClassName = (arrayIndex: number, wordIndex: number): string => {
        if (inputValue[wordIndex] === generatedWords[arrayIndex][wordIndex] && arrayIndex == indexOfGeneratedWords)
            return 'correct';
        else if (inputValue[wordIndex] !== generatedWords[arrayIndex][wordIndex] && arrayIndex == indexOfGeneratedWords) {
            return 'selected';
        }
        else if (indexOfGeneratedWords > arrayIndex)
            return 'finished';
        else
            return '';
    }

    return (
        <Box>
            <Box mb={1} >
                <Typography variant='h2' textAlign='center'>{WPM} WPM</Typography>
            </Box>
            <Box mb={1}>
                <Typography variant='h6' textAlign='center'>{timer.toFixed(1)} sec</Typography>
            </Box>

            <div className="center">
                <div id="gameDisplay">
                    {generatedWords.map((word: string, arrayIndex: number) => {
                        return (
                            <Box key={'word_' + arrayIndex} id={'word_' + arrayIndex}>
                                {word.split('').map((letter: string, wordIndex: number) => {
                                    return (
                                        <Box component="span" className={getWordLetterClassName(arrayIndex, wordIndex)} key={wordIndex}>{letter}</Box>
                                    )
                                })
                                }&nbsp;
                            </Box>
                        )

                    }
                    )}
                </div>

            </div>
            <input ref={inputRef} disabled={!isGameStarted} autoComplete='off' className='input-center' type="text" id="input" value={inputValue} onChange={onInput} />
            <Box my={1} textAlign={'center'}>
                <Box mb={0.5} display="flex" justifyContent="center">
                    <Button variant='contained' color='info' onClick={startGame}>Start</Button> &nbsp;
                    {props.players.length == 0 && <Button variant='outlined' color='warning' onClick={generateNewText}>Generate new text</Button>}
                    <KeyboardSound wpm={WPM} ref={keybodardSoundRef} />

                </Box>
            </Box>
        </Box>
    );
}


export default GameDisplay;