import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { GetServerSideProps } from 'next'
import GameDisplay from '../components/GameDisplay';
import socket from '../components/Socket';

import { Typography, FormControl, Box, TextField, Button } from '@mui/material';

interface props {
  data: string
}

interface player {
  id: string,
  name: string,
  ready: boolean,
  progress: number,
  finishedPlace: number
}

const Home: NextPage<props> = (props) => {

  const [playerName, setPlayerName] = useState('' as string);
  const [submittedRoomName, setSubmitedRoomName] = useState('' as string);
  const [roomName, setRoomName] = useState('' as string);
  const [players, setPlayers] = useState([] as player[]);
  const [data, setData] = useState(props.data);


  const joinRoom = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    socket.emit('joinRoom', { userName: playerName, roomName: roomName, text: data });
  }

  socket.on('joinRoom', (text: string, players: player[]) => {
    setPlayers(players);
    setSubmitedRoomName(roomName);
    setData(text);
  })

  socket.on('leaveRoom', () => {
    setPlayers([]);
    setSubmitedRoomName('');
  });

  socket.on('error', (error: string) => {
    console.log(error);
  })

  socket.on('playerReady', (players: player[]) => {
    setPlayers(players);
  })

  socket.on('playerProgress', (players: player[]) => {
    setPlayers(players);
  })

  socket.on('gameFinished', (players: player[]) => {
    setPlayers(players);
  })

  return (
    <Box m={2} >
      <Head>
        <title>Gotta Type Fast</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {submittedRoomName !== '' ?
        <Box textAlign="right">
          <Typography variant="h3" textAlign="right">Welcome {playerName}</Typography>
          <Typography variant='h3'>{players.length} players in {submittedRoomName} room</Typography>

          {players.map((player: player) => {
            return (
              <Typography variant='h4' key={player.id}>{((player.progress / data.split(/\s+/).length) * 100).toFixed(1)}% <span className={player.ready ? 'correct' : ''}>{player.name} {player.finishedPlace > 0 && <span>{player.finishedPlace}</span>}</span></Typography>
            )
          })
          }
        </Box>
        :
        <Box mb={2} sx={{ width: '100%' }}>
          <Typography textAlign={'right'} variant="h4">Gotta Type Fast [WIP]</Typography>
          <form style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', alignItems: 'flex-end' }} onSubmit={joinRoom}>
            <Box mx={1}>
              <FormControl required>
                <TextField required variant='standard' label="Username" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
              </FormControl>
            </Box>
            <Box mx={1}>
              <FormControl required>
                <TextField required variant='standard' label="Room name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
              </FormControl>
            </Box>
            <FormControl>
              <Button type='submit' variant='outlined' size='small' >Join room</Button>
            </FormControl>
          </form>
        </Box>
      }

      <GameDisplay roomName={submittedRoomName} players={players} data={data.split(/\s+/)} />
    </Box>
  )
}


export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch('http://metaphorpsum.com/paragraphs/1/5');
  const data = await res.text();
  return {
    props: {
      data
    }
  }
}

export default Home
