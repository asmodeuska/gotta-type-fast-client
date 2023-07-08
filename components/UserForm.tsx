import React, { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'
import socket from '../components/Socket';
import { Typography, FormControl, Box, TextField, Button } from '@mui/material';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { get } from 'http';


interface props {
    onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRoomNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    text: string;
};

const UserForm = (props: props): JSX.Element =>  {

    const [username, setUsername] = useState('' as string);
    const [savedUsername, setSavedUsername] = useState('' as string);
    const [roomName, setRoomName] = useState('' as string);
  

    useEffect(() => {
        let username = getCookie('username');
        let userID = getCookie('userID');
        if (username === undefined || userID === undefined) {
            return;
        }
        socket.emit('checkUser', { username: username, userID: userID });
    }, [])

    socket.on('userChecked', (valid: boolean, username: string, userID: string) => {
        console.log(valid, username, userID);
        if (valid) {
            setCookie('username', username, { maxAge: 60 * 60 * 24 * 7 });
            setCookie('userID', userID, { maxAge: 60 * 60 * 24 * 7 });
            setSavedUsername(username);
        }
        else {
            deleteCookie('username');
            deleteCookie('userID');
        }
    })

    const saveUsername = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        socket.emit('saveUsername', username);
    }

    const joinRoom = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        //todo
    }


    useEffect(() => {
        props.onUsernameChange({ target: { value: savedUsername } } as React.ChangeEvent<HTMLInputElement>);
        props.onRoomNameChange({ target: { value: roomName } } as React.ChangeEvent<HTMLInputElement>);
    }, [savedUsername, roomName])


    return (
        <>
            <Typography textAlign="right" variant="h3">Gotta Type Fast [WIP]</Typography>
            {savedUsername === '' ?
                <Box mt={2} textAlign="right">
                    <form style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', alignItems: 'flex-end' }} onSubmit={saveUsername}>
                        <Box mx={1}>
                            <FormControl required>
                                <TextField required variant='standard' label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </FormControl>
                        </Box>
                        <FormControl>
                            <Button type='submit' variant='outlined' size='small' >Save</Button>
                        </FormControl>
                    </form>
                </Box>
                :
                <Box mt={2} sx={{ width: '100%' }}>
                    <Typography textAlign="right" variant="h4">Welcome {savedUsername}!</Typography>
                    <form style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', alignItems: 'flex-end' }} onSubmit={joinRoom}>
                        <Box mx={1}>
                            <FormControl required>
                                <TextField required variant='standard' label="Room name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                            </FormControl>
                        </Box>
                        <FormControl>
                            <Button disabled type='submit' variant='outlined' size='small' >[TODO]Join room</Button>
                        </FormControl>
                    </form>
                </Box>
            }
        </>
    );
}

export default UserForm;