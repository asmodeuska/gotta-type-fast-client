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
  progress: number
}

const Home: NextPage<props> = (props) => {

  const [Username, setUsername] = useState('' as string);
  const [SubmittedRoomName, setSubmitedRoomName] = useState('' as string);
  const [Roomname, setRoomname] = useState('' as string);
  const [Players, setPlayers] = useState([] as player[]);
  const [data, setData] = useState(props.data);


  const joinRoom = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    socket.emit('joinRoom', { userName: Username, roomName: Roomname, text: data });
  }

  socket.on('joinRoom', (text: string, players: player[]) => {
    setPlayers(players);
    setSubmitedRoomName(Roomname);
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

  return (
    <Box m={2} >
      <Head>
        <title>Gotta Type Fast</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {SubmittedRoomName !== '' ?
        <Box textAlign="right">
          <Typography variant='h3'>{Players.length} players in {SubmittedRoomName} room</Typography>

          {Players.map((player: player) => {
            return <Typography variant='h4' key={player.id}>{((player.progress / data.split(/\s+/).length) * 100).toFixed(1)}% <span className={player.ready ? 'correct' : ''}>{player.name}</span></Typography>
          })
          }
        </Box>
        :
        <Box mb={2} sx={{ width: '100%'}}>
          <Typography textAlign={'right'} variant="h4">Gotta Type Fast</Typography>
          <form style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', alignItems: 'flex-end' }} onSubmit={joinRoom}>
            <Box mx={1}>
              <FormControl required>
                <TextField required variant='standard' label="Username" value={Username} onChange={(e) => setUsername(e.target.value)} />
              </FormControl>
            </Box>
            <Box mx={1}>
              <FormControl required>
                <TextField required variant='standard' label="Room name" value={Roomname} onChange={(e) => setRoomname(e.target.value)} />
              </FormControl>
            </Box>
            <FormControl>
              <Button type='submit' variant='outlined' size='small' >Join room</Button>
            </FormControl>
          </form>
        </Box>
      }

      <GameDisplay roomName={SubmittedRoomName} players={Players} data={data.split(/\s+/)} />
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
