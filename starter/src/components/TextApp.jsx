import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { BeatLoader } from "react-spinners";

import TextAppMessageList from "./TextAppMessageList";
import Constants from "../constants/Constants";

function TextApp() {
    // Set to true to block the user from sending another message
    const [isLoading, setIsLoading] = useState(false);

    const [messages, setMessages] = useState([]);
    const inputRef = useRef();

    /**
     * Called when the TextApp initially mounts.
     */
    async function handleWelcome() {
        if (messages.length === 0) {
            addMessage(
                Constants.Roles.Assistant,
                "Welcome, my name is Bucky. How can I help you?",
            );
        }
    }

    /**
     * Called whenever the "Send" button is pressed.
     * @param {Event} e default form event; used to prevent from reloading the page.
     */
    async function handleSend(e) {
        e?.preventDefault();
        const input = inputRef.current.value?.trim();
        setIsLoading(true);
        if (input) {
            addMessage(Constants.Roles.User, input);
            inputRef.current.value = "";

            const data = await fetch(
                "https://api.deepseek.com/chat/completions",
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            "Bearer " + import.meta.env.VITE_DEEPSEEK_API_KEY,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        messages: [
                            ...messages,
                            { role: Constants.Roles.User, content: input },
                        ],
                        model: "deepseek-v4-flash",
                        thinking: {
                            type: "disabled",
                        },
                        stream: true,
                    }),
                },
            );

            addMessage(Constants.Roles.Assistant, "");

            const reader = data.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let buf = "";
            while (!done) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                buf += decoder.decode(value, { stream: true });
                const lines = buf.split("\n\n");
                buf = lines.pop() ?? ""; // the last one may not complete
                for (let line of lines) {
                    if (line.startsWith("data: ")) {
                        line = line.slice(6).trim();
                    }
                    if (line !== "[DONE]") {
                        const delta = JSON.parse(line).choices[0].delta.content;
                        setMessages((old) => {
                            return [
                                ...old.slice(0, -1),
                                {
                                    role: old.at(-1).role,
                                    content: old.at(-1).content + delta,
                                },
                            ];
                        });
                    }
                }
            }
        }
        setIsLoading(false);
    }

    /**
     * Adds a message to the ongoing TextAppMessageList
     *
     * @param {string} role The role of the message; either "user", "assistant", or "developer"
     * @param {*} content The content of the message
     */
    function addMessage(role, content) {
        setMessages((o) => [
            ...o,
            {
                role: role,
                content: content,
            },
        ]);
    }

    useEffect(() => {
        handleWelcome();
    }, []);

    return (
        <div className="app">
            <TextAppMessageList messages={messages} />
            {isLoading ? <BeatLoader color="#36d7b7" /> : <></>}
            <div className="input-area">
                <Form className="inline-form" onSubmit={handleSend}>
                    <Form.Control
                        ref={inputRef}
                        style={{ marginRight: "0.5rem", display: "flex" }}
                        placeholder="Type a message..."
                        aria-label="Type and submit to send a message."
                    />
                    <Button type="submit" disabled={isLoading}>
                        Send
                    </Button>
                </Form>
            </div>
        </div>
    );
}

export default TextApp;
