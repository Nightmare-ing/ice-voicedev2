# README

## Use CS571-liked API Server

The CS571 AI API is not open to the public, instead they offer an [alternative API](https://github.com/P-mandevillei/CS571-hw11-server), which we have to provide our own Gemini API key to use.
However, because Google may has updated the API, and take off the gemini-2.0-flash model, we have to use the gemini-3.5-flash model at July 31, 2026.
Thus we need to run the wrap up server on our local machine, the process is shown as following:

First, modify the server code to use newer model,

```js
// functions/completions.js
try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        history: chatHistory,
    });

    // Messages with roles + contents
    const response = await chat.sendMessage({
        message: msg,
    });

    return {
        headers: corsHeaders,
        statusCode: 200,
        body: JSON.stringify({
            msg: response.text,
        }),
    };
} catch (err) {
    console.error(err);
    return {
        headers: corsHeaders,
        statusCode: 401,
        body: JSON.stringify({ msg: "Invalid API Key." }),
    };
}
```

```js
// edge-functions/completions-stream.js
try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        history: chatHistory,
    });

    // Messages with roles + contents
    const response = await chat.sendMessage({
        message: msg,
    });

    return {
        headers: corsHeaders,
        statusCode: 200,
        body: JSON.stringify({
            msg: response.text,
        }),
    };
} catch (err) {
    console.error(err);
    return {
        headers: corsHeaders,
        statusCode: 401,
        body: JSON.stringify({ msg: "Invalid API Key." }),
    };
}
```

Second, install `netlify-cli` and run the server on your local machine:

```bash
npm install -g netlify-cli
netlify dev
```

Third, create a `.env.local` file in the root directory of the project, and add your Gemini API key to it:

```bash
# .env.local
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Then access this API key in your ICE code or HW11 code by using `import.meta.env.VITE_GEMINI_API_KEY` with `http://localhost:8888/.netlify/functions/completions` or `http://localhost:8888/.netlify/edge-functions/completions-stream`

## Use Official Model Provider's API

It seems that Gemini API may detect you IP address, and then block your request on Free Tier, unless you have a paid plan.
So I turn to DeepSeek platform and use their official API, which is very cheep, and is enough for completing the ICE and HW11.
