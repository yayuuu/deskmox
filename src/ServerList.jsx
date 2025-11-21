import React from "react";
import ServerCard from "./ServerCard.jsx";
import { Container, Button, Stack, AppBar, Toolbar, Box } from "@mui/material";


export default function ServerList({setAppPage, serverList, handleConnect, handleEdit}) {
    return (
        <Box sx={{display: "flex", flexDirection: "column", height: "100vh"}}>
            <AppBar position="static">
                <Toolbar variant="dense"  sx={{backgroundColor: theme => theme.palette.background.toolbar}}>
                    <Stack direction="row" spacing={2} sx={{ px: 0 }}>
                        <Button
                            variant="text"
                            color="secondary"
                            onClick={() => handleEdit(null)}
                        >
                            Nowy serwer
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>
            <Box sx={(theme) => ({
                flex: 1, overflowY: 'auto', my:2, pl:1, mr:1,
                "&::-webkit-scrollbar": {
                    width: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: "4px",
                },
                "&::-webkit-scrollbar-track": {
                    backgroundColor: theme.palette.background.default,
                }
            })}>
                {serverList.map((srv, i) => (
                    <Container maxWidth={true} disableGutters sx={{m:0, mt: i==0? 0 : 2, px: 1 }}>
                        <ServerCard server={srv} handleConnect={handleConnect} handleEdit={handleEdit} />
                    </Container>
                ))}
            </Box>
        </Box>
    );
}