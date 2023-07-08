import React, { useEffect, useState, useRef } from 'react';
import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { GetServerSideProps } from 'next'
import GameDisplay from '../components/GameDisplay';
import socket from '../components/Socket';
import UserForm from '../components/UserForm';
import { Typography, Box, IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

interface props {
  data: string
}

interface player {
  name: string,
  ready: boolean,
  progress: string,
}

const Home: NextPage<props> = (props) => {

  const [submittedRoomName, setSubmitedRoomName] = useState('' as string);
  const [players, setPlayers] = useState([] as player[]);
  const [data, setData] = useState(props.data as string);
  const [savedUsername, setSavedUsername] = useState('' as string);
  const [roomName, setRoomName] = useState('' as string);
  const userFormRef = useRef(null);


  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSavedUsername(e.target.value);
  }

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  }

  const onLeaveRoom = () => {
    socket.emit('leaveRoom');
    setSubmitedRoomName('');
  }

  socket.on('roomJoined', (roomName: string, players: player[], data: string) => {
    console.log('roomJoined', roomName, players, data);
    setSubmitedRoomName(roomName);
    setPlayers(players);
    console.log(players.length);
    setData(data);
  });

  socket.on('playerUpdated', (players: player[]) => {
    console.log('playerUpdated', players);
    setPlayers(players);
  });


  return (
    <Box m={2} >
      <Head>
        <title>Gotta Type Fast</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {submittedRoomName !== '' ?
        <Box textAlign="right">
          <Typography variant='h3'>{players.length} players in {submittedRoomName} room</Typography>
          <Box display="flex" justifyContent="end">
            <Typography variant="h4" textAlign="right">Welcome {savedUsername}</Typography>
            <IconButton onClick={onLeaveRoom}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>
        :
        <UserForm onUsernameChange={handleUsernameChange} onRoomNameChange={handleRoomNameChange} text={data} />
      }

      <GameDisplay roomName={submittedRoomName} players={players} data={data.split(/\s+/)} />
    </Box>
  )
}


export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(process.env.NEXT_PUBLIC_SOCKET_IO + '/generate');
  const data = await res.text();
  return {
    props: {
      data
    }
  }
}

export default Home
