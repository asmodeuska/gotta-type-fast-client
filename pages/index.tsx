import React, { useEffect, useState, useRef } from 'react';
import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { GetServerSideProps } from 'next'
import GameDisplay from '../components/GameDisplay';
import socket from '../components/Socket';
import UserForm from '../components/UserForm';
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

  const [submittedRoomName, setSubmitedRoomName] = useState('' as string);
  const [players, setPlayers] = useState([] as player[]);
  const [data, setData] = useState(props.data);
  const [savedUsername, setSavedUsername] = useState('' as string);
  const [roomName, setRoomName] = useState('' as string);
  const userFormRef = useRef(null);


  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSavedUsername(e.target.value);
  }

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  }


  return (
    <Box m={2} >
      <Head>
        <title>Gotta Type Fast</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {submittedRoomName !== '' ?
        <Box textAlign="right">
          <Typography variant="h3" textAlign="right">Welcome {savedUsername}</Typography>
          <Typography variant='h3'>{players.length} players in {submittedRoomName} room</Typography>

          {players.map((player: player) => {
            return (
              <Typography variant='h4' key={player.id}>{((player.progress / data.split(/\s+/).length) * 100).toFixed(1)}% <span className={player.ready ? 'correct' : ''}>{player.name} {player.finishedPlace > 0 && <span>{player.finishedPlace}</span>}</span></Typography>
            )
          })
          }
        </Box>
        :
        <UserForm onUsernameChange={handleUsernameChange} onRoomNameChange={handleRoomNameChange} text={data}/>
      }

      <GameDisplay roomName={submittedRoomName} players={players} data={data.split(/\s+/)} />
    </Box>
  )
}


export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(process.env.NEXT_PUBLIC_SOCKET_IO +'/generate');
  const data = await res.text();
  return {
    props: {
      data
    }
  }
}

export default Home
