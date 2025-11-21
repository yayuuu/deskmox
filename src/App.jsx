import React from "react";
import { useState, useEffect } from "react";
import ServerList from "./ServerList.jsx";
import { ThemeProvider, createTheme, CssBaseline, Container, Button, Stack } from "@mui/material";
import Connecting from "./Connecting.jsx";
import Edit from "./Edit.jsx";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: "#bf616a",
        },
        secondary: {
            main: "#cdd6f4",
        },
        background: {
            default: "#23262e",   // tło aplikacji
            toolbar: "#0e131a",   // tło aplikacji
            paper:   "#23262e",   // tło kart / okien / containerów
            //paper:   "#4c566a",   // tło kart / okien / containerów
        }
    },
});

export default function App() {
    const [servers, setServers] = useState([]);
    const [appPage, setAppPage] = useState("list");
    const [addr, setAddr] = useState("");
    const [server, setServer] = useState({});
    const handleConnect = async (addr, ssl) => {
        setAddr(addr);
        setAppPage("connecting");
        console.log("Łączenie z " + addr);
        let isConnected = await window.appAPI.connect(addr, ssl);
        setAppPage("list");
        if (!isConnected) {
            alert("Nie udało się połączyć z serwerem " + addr);
        }
    }
    const handleEdit = (name) => {
        if(name == null) {
            setServer({
                name: null,
                address: null,
                ssl: true
            });
        } else {
            servers.forEach((srv) => {
                if(srv.name == name) {
                    setServer({
                        name: srv.name,
                        address: srv.address,
                        ssl: srv.ssl
                    });
                }
            });
        }
        
        setAppPage("edit");
    }
    const handleSave = async (srv) => {
        await window.appAPI.saveServer(server.name, srv);
        const list = window.appAPI?.getServerList();
        setServers(list);
        setAppPage("list");
    }

    useEffect(() => {
        const list = window.appAPI?.getServerList();
        setServers(list);
    }, []);

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            {appPage === "list" && (
                <ServerList setAppPage={setAppPage} serverList={servers} handleConnect={handleConnect} handleEdit={handleEdit} />
            )}
            {appPage === "edit" && (
                <Edit server={server} onSubmit={handleSave} onCancel={() => setAppPage("list")} />
            )}
            {appPage === "connecting" && (
                <Connecting addr={addr} />
            )}
        </ThemeProvider>
    );
}