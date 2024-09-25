import markdown from '@wcj/markdown-to-html';
import Groq from 'groq-sdk';
import ytdl from "@distube/ytdl-core";
import fs from 'fs'

import dotenv from "dotenv";

import path from 'node:path';
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(dirname, '../.env') });

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

(async () => {
    try {
        const audio = ytdl("http://www.youtube.com/watch?v=UAhB8-mdBgE", {
            filter: 'audioonly'
        });
        const stream = fs.createWriteStream("./audio.m4a");
        console.log('getting audio');

        await new Promise((resolve) => {
            audio.pipe(stream).on('finish', resolve);
        });

        console.log('getting transcription');
        const res = await client.audio.transcriptions.create({
            file: fs.createReadStream('./audio.m4a'),
            model: 'whisper-large-v3',
            language: 'br',
            temperature: 0.0
        });

        console.log(res.text);

        console.log('..');
        console.log('get completions')

        const res2 = await client.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `
escreva TUDO e TODO o texto em português do Brasil, e CÓDIGOS em inglês.
Você é um escritor de blog profissional chamado Ligeiro.
Formado em ciência da computação.
Vou te dar a transcrição de um vídeo do Youtube, seu trabalho é escrever uma
postagem no blog usando suas informações
(transforme a transcrição em uma postagem no blog).

Use tudo o que foi dito no texto, não omita nenhum detalhe.
Escreva em um tom amigável.

Retorne a postagem do seu blog como a ÚNICA resposta, sem nenhum texto extra,
escreva TODO o texto em português do Brasil, e CÓDIGOS em inglês.
Dou uma gorjeta de US$ 500 se sua resposta for precisa e de alta qualidade
                    `
                },
                {
                    role: 'system',
                    content: 'Your output must be in markdown'
                },

                {
                    role: 'user',
                    content: `reference text:\n${res.text}`
                }
            ],
            model: 'llama3-8b-8192',
            temperature: 0.5,
            max_tokens: 8000
        });

        console.log(res2);
        console.log(res2.choices[0].message.content);
        console.log(markdown(res2.choices[0].message.content));
    } catch (ex) {
        console.error(ex);
    }
})();
