import React from "react";
import { Card, CardContent, Typography, Button, Stack } from "@mui/material";

export default function ServerCard({ server, handleConnect, handleEdit }) {
  return (
    <Card variant='outlined' sx={{ color: "white"}}>
      <CardContent>
        <Typography variant="h5">{server.name}</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {server.address}
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleConnect(server.address, server.ssl)}
          >
            Połącz
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => handleEdit(server.name)}
          >
            Edytuj
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
