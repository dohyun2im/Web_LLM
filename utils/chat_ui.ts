import { type ChatInterface } from "@mlc-ai/web-llm";

export default class ChatUI {
    private chat: ChatInterface;
    private chatLoaded = false;
    private requestInProgress = false;
    private chatRequestChain: Promise<void> = Promise.resolve();

    constructor(chat: ChatInterface) {
        this.chat = chat;
    }
    private pushTask(task: () => Promise<void>) {
        const lastEvent = this.chatRequestChain;
        this.chatRequestChain = lastEvent.then(task);
    }

    async onGenerate(
        prompt: string,
        messageUpdate: (kind: string, text: string, append: boolean) => void,
        setRuntimeStats: (runtimeStats: string) => void
    ) {
        if (this.requestInProgress) {
            return;
        }
        this.pushTask(async () => {
            await this.asyncGenerate(prompt, messageUpdate, setRuntimeStats);
        });
        return this.chatRequestChain;
    }

    async onReset(clearMessages: () => void) {
        if (this.requestInProgress) {
            // interrupt previous generation if any
            this.chat.interruptGenerate();
        }
        // try reset after previous requests finishes
        this.pushTask(async () => {
            await this.chat.resetChat();
            clearMessages();
        });
        return this.chatRequestChain;
    }

    async asyncInitChat(messageUpdate: (kind: string, text: string, append: boolean) => void) {
        if (this.chatLoaded) return;
        this.requestInProgress = true;
        messageUpdate("init", "", true);
        const initProgressCallback = (report: { text: string }) => {
            messageUpdate("init", report.text, false);
        };
        this.chat.setInitProgressCallback(initProgressCallback);

        try {
            await this.chat.reload("vicuna-v1-7b-q4f32_0", undefined, {
                model_list: [
                    {
                        model_url: "https://huggingface.co/mlc-ai/mlc-chat-vicuna-v1-7b-q4f32_0/resolve/main/",
                        local_id: "vicuna-v1-7b-q4f32_0",
                    },
                ],
                model_lib_map: {
                    "vicuna-v1-7b-q4f32_0":
                        "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/vicuna-v1-7b-q4f32_0-webgpu-v1.wasm",
                },
            });
        } catch (err: unknown) {
            messageUpdate("error", "Init error, " + (err?.toString() ?? ""), true);
            console.log(err);
            await this.unloadChat();
            this.requestInProgress = false;
            return;
        }
        this.requestInProgress = false;
        this.chatLoaded = true;
    }

    private async unloadChat() {
        await this.chat.unload();
        this.chatLoaded = false;
    }

    private async asyncGenerate(
        prompt: string,
        messageUpdate: (kind: string, text: string, append: boolean) => void,
        setRuntimeStats: (runtimeStats: string) => void
    ) {
        await this.asyncInitChat(messageUpdate);
        this.requestInProgress = true;
        // const prompt = this.uiChatInput.value;
        if (prompt == "") {
            this.requestInProgress = false;
            return;
        }

        messageUpdate("right", prompt, true);

        messageUpdate("left", "", true);
        const callbackUpdateResponse = (step: number, msg: string) => {
            messageUpdate("left", msg, false);
        };

        try {
            const output = await this.chat.generate(prompt, callbackUpdateResponse);
            messageUpdate("left", output, false);
            this.chat
                .runtimeStatsText()
                .then((stats) => setRuntimeStats(stats))
                .catch((error) => console.log(error));
        } catch (err: unknown) {
            messageUpdate("error", "Generate error, " + (err?.toString() ?? ""), true);
            console.log(err);
            await this.unloadChat();
        }
        this.requestInProgress = false;
    }
}
