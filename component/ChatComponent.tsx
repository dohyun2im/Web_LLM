import { useState } from "react";
import { ChatModule } from "@mlc-ai/web-llm";
import ChatUI from "../utils/chat_ui";
import _ from "lodash";
import {
    Avatar,
    Button,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Skeleton,
    TextField,
    Typography,
} from "@mui/material";
import { CloudDownload, RestartAlt, Send } from "@mui/icons-material";
import { deepPurple, orange } from "@mui/material/colors";
import NumberProgress from "./NumberProgress";

const ChatComponent = () => {
    const [chat_ui] = useState(new ChatUI(new ChatModule()));
    const [messages, setMessages] = useState<{ kind: string; text: string }[]>([]);
    const [prompt, setPrompt] = useState<string>("");
    const [runtimeStats, setRuntimeStats] = useState<string>("");
    const [download, setDownload] = useState<number>(0);

    const updateMessage = (kind: string, text: string, append: boolean) => {
        let customText = text;
        if (text === "Start to fetch params") customText = "LLM을 다운로드 중입니다 . . .";
        if (kind == "init") {
            const per = text.match(/(\d{1,2})%/);
            if (per) {
                setDownload(Number(per[1]));
                return;
            }
        }
        const msgCopy = [...messages];
        if (msgCopy.length == 0 || append) {
            setMessages([...msgCopy, { kind, text: customText }]);
        } else {
            msgCopy[msgCopy.length - 1] = { kind, text: customText };
            setMessages([...msgCopy]);
        }
    };

    return (
        <Grid container py={2} px={3}>
            <Grid item xs={12}>
                {download > 0 && <NumberProgress value={download} />}
            </Grid>

            <Grid item xs={12}>
                <Button
                    variant="contained"
                    sx={{ background: deepPurple[500], mr: 1 }}
                    startIcon={<CloudDownload />}
                    onClick={() => chat_ui.asyncInitChat(updateMessage).catch((err) => console.log(err))}>
                    Download
                </Button>
                <Button
                    variant="contained"
                    sx={{ background: orange[300] }}
                    startIcon={<RestartAlt />}
                    onClick={() => {
                        chat_ui
                            .onReset(() => {
                                setMessages([]);
                            })
                            .catch((error) => console.log(error));
                    }}>
                    Reset
                </Button>
            </Grid>

            <Grid item xs={12} sx={{ background: "#fff", minHeight: 400, borderRadius: 2, color: "#000" }} my={2} p={2}>
                <List sx={{ width: "100%" }}>
                    {messages.map((value, index) => (
                        <div key={index}>
                            <ListItem alignItems="center">
                                <ListItemAvatar sx={{ fontSize: 20 }}>
                                    <Avatar>🤖</Avatar>
                                </ListItemAvatar>
                                {value.text ? (
                                    <ListItemText primary={value.text} />
                                ) : (
                                    <Skeleton sx={{ width: "100%" }} />
                                )}
                            </ListItem>
                            <Divider variant="inset" component="li" />
                        </div>
                    ))}
                </List>
            </Grid>

            <Grid item xs={12}>
                <TextField
                    fullWidth
                    placeholder="Enter your message !"
                    variant="filled"
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            chat_ui
                                .onGenerate(prompt, updateMessage, setRuntimeStats)
                                .catch((error) => console.log(error))
                                .finally(() => setPrompt(""));
                        }
                    }}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    InputProps={{
                        endAdornment: (
                            <IconButton
                                onClick={() => {
                                    chat_ui
                                        .onGenerate(prompt, updateMessage, setRuntimeStats)
                                        .catch((error) => console.log(error))
                                        .finally(() => setPrompt(""));
                                }}>
                                <Send sx={{ color: deepPurple[500] }} />
                            </IconButton>
                        ),
                    }}
                    sx={{ background: "#fff", borderRadius: 2, ".MuiFilledInput-input": { px: 1, py: 2 } }}
                />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="caption">{runtimeStats}</Typography>
            </Grid>
        </Grid>
    );
};

export default ChatComponent;
