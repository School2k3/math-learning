// src/services/questionAudioService.ts
import { GoogleGenAI } from '@google/genai';
import mime from 'mime';
import cloudinary from '../utils/cloudinary.js';
let ai = null;
const DEFAULT_TTS_MODEL = process.env.GEMINI_TTS_MODEL ?? 'gemini-2.5-flash-preview-tts';
const DEFAULT_VOICE = process.env.GEMINI_TTS_VOICE ?? 'Zephyr';
function getGenAiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    if (!ai) {
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
}
function buildPromptFromQuestion(input) {
    const lines = [
        'Hãy đọc chậm rãi, rõ ràng như giáo viên tiểu học.',
        `Câu hỏi: ${input.questionText}`
    ];
    input.answers.forEach((ans, idx) => {
        lines.push(`Đáp án ${idx + 1}: ${ans.answerText}`);
    });
    return lines.join('\n');
}
async function generateAudioBuffer(prompt) {
    const client = getGenAiClient();
    const stream = await client.models.generateContentStream({
        model: DEFAULT_TTS_MODEL,
        config: {
            temperature: 1,
            responseModalities: ['audio'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: {
                        voiceName: DEFAULT_VOICE
                    }
                }
            }
        },
        contents: [
            {
                role: 'user',
                parts: [{ text: prompt }]
            }
        ]
    });
    const chunks = [];
    let detectedMime;
    for await (const chunk of stream) {
        const parts = chunk.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
            if (!part.inlineData)
                continue;
            const decoded = decodeInlineAudio(part.inlineData);
            detectedMime = detectedMime ?? decoded.mimeType;
            chunks.push(decoded.buffer);
        }
    }
    if (!chunks.length) {
        throw new Error('No audio data received from Gemini');
    }
    const mimeType = detectedMime ?? 'audio/wav';
    const fileExtension = mime.getExtension(mimeType) ?? 'wav';
    return {
        buffer: Buffer.concat(chunks),
        mimeType,
        fileExtension
    };
}
function decodeInlineAudio(inlineData) {
    if (!inlineData.data) {
        throw new Error('Inline audio missing data');
    }
    const mimeType = inlineData.mimeType ?? 'audio/wav';
    if (mimeType.startsWith('audio/pcm') || /^audio\/L\d+/i.test(mimeType)) {
        return {
            buffer: convertPcmToWav(inlineData.data, mimeType),
            mimeType: 'audio/wav'
        };
    }
    return {
        buffer: Buffer.from(inlineData.data, 'base64'),
        mimeType
    };
}
function convertPcmToWav(base64, mimeType) {
    const options = parsePcmMimeType(mimeType);
    const pcmBuffer = Buffer.from(base64, 'base64');
    const header = createWavHeader(pcmBuffer.length, options);
    return Buffer.concat([header, pcmBuffer]);
}
function parsePcmMimeType(mimeType) {
    const [, ...paramSegments] = mimeType.split(';');
    const params = paramSegments.map((segment) => segment.trim());
    const options = {
        numChannels: 1,
        sampleRate: 24000,
        bitsPerSample: 16
    };
    const [, format] = mimeType.split('/');
    if (format?.startsWith('L')) {
        const bits = parseInt(format.substring(1), 10);
        if (!Number.isNaN(bits)) {
            options.bitsPerSample = bits;
        }
    }
    for (const param of params) {
        const [key, value] = param.split('=').map((segment) => segment.trim());
        if (key === 'rate') {
            const parsed = parseInt(value, 10);
            if (!Number.isNaN(parsed))
                options.sampleRate = parsed;
        }
        if (key === 'channels') {
            const parsed = parseInt(value, 10);
            if (!Number.isNaN(parsed))
                options.numChannels = parsed;
        }
        if (key === 'bitrate' || key === 'bits') {
            const parsed = parseInt(value, 10);
            if (!Number.isNaN(parsed))
                options.bitsPerSample = parsed;
        }
    }
    return options;
}
function createWavHeader(dataLength, options) {
    const { numChannels, sampleRate, bitsPerSample } = options;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const buffer = Buffer.alloc(44);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataLength, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bitsPerSample, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataLength, 40);
    return buffer;
}
function uploadAudioToCloudinary(buffer, options) {
    return new Promise((resolve, reject) => {
        const publicId = options.questionId ? `question_${options.questionId}` : `question_${Date.now()}`;
        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type: 'video',
            folder: 'math-learning/questions',
            public_id: publicId,
            overwrite: true,
            format: options.fileExtension
        }, (error, result) => {
            if (error || !result) {
                return reject(error || new Error('Cloudinary upload failed'));
            }
            resolve({ url: result.secure_url });
        });
        uploadStream.end(buffer);
    });
}
export async function synthesizeQuestionAudio(input) {
    const prompt = buildPromptFromQuestion(input);
    const { buffer, mimeType, fileExtension } = await generateAudioBuffer(prompt);
    const upload = await uploadAudioToCloudinary(buffer, {
        questionId: input.questionId,
        fileExtension
    });
    return {
        audioUrl: upload.url,
        mimeType
    };
}
