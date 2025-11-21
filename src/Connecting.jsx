import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function Connecting({addr}) {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,        // odstęp między spinnerem a tekstem
      }}
    >
      <CircularProgress />
      <Typography variant="h6">
        Łączenie z serwerem {addr}...
      </Typography>
    </Box>
  );
}
