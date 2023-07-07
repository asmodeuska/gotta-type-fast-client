import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Howl, Howler } from 'howler';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Box, Button, IconButton } from '@mui/material';

interface props {
    wpm: number;
}

const SoundEffect = forwardRef((props: props, ref) => {
    const [wpm, setWpm] = useState(props.wpm as number);
    const [pitchRate, setPitchRate] = useState(1 as number);
    const [isMuted, setIsMuted] = useState(false as boolean);

    useEffect(() => {
        setWpm(props.wpm);
    }, [props.wpm]);

    useEffect(() => {
        if (isMuted) {
            Howler.mute(true);
        } else {
            Howler.mute(false);
        }
    }, [isMuted]);


    useEffect(() => {
        const targetPitchRate = wpmToPitchRate();
        const interval = setInterval(() => {
            if (pitchRate < targetPitchRate) {
                setPitchRate(Math.min(pitchRate + 0.1, targetPitchRate));
            } else if (pitchRate > targetPitchRate) {
                setPitchRate(Math.max(pitchRate - 0.1, targetPitchRate));
            }
        }, 100);
        return () => clearInterval(interval);
    }, [wpm, pitchRate]);

    useImperativeHandle(ref, () => ({
        play() {
            const sound = new Howl({
                src: ['/sounds/keypress.wav'],
                rate: pitchRate,
            });
            sound.play();
        }
    }));

    const wpmToPitchRate = () => {
        const minWpm = 0;
        const maxWpm = 150;
        const minPitchRate = .8;
        const maxPitchRate = 1.4;

        const clampedWpm = Math.min(Math.max(wpm, minWpm), maxWpm);
        const normalizedWpm = (clampedWpm - minWpm) / (maxWpm - minWpm);
        const pitchRate = normalizedWpm * (maxPitchRate - minPitchRate) + minPitchRate;

        return pitchRate;
    };

    return (
        <Box>
            <IconButton onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
        </Box>
    );
});

export default SoundEffect;
