"use client";

import ChatComponent from "@/component/ChatComponent";
import Header from "@/component/Header";
import { SnackbarProvider } from "notistack";

export default function Home() {
    return (
        <SnackbarProvider maxSnack={3}>
            <Header />
            <ChatComponent />
        </SnackbarProvider>
    );
}
