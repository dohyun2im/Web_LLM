"use client";

import { Chat } from "@mui/icons-material";
import { AppBar, Avatar, Box, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import { deepPurple } from "@mui/material/colors";

export default function Header() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar sx={{ background: deepPurple[500] }}>
                    <IconButton size="large" edge="start" color="inherit">
                        <Chat fontSize="large" />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
                        Web LLM
                    </Typography>
                    <Avatar alt="dohyun" src="./favicon.ico" sx={{ mr: 0.42 }} />
                </Toolbar>
            </AppBar>
        </Box>
    );
}
