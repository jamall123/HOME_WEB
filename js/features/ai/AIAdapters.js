/**
 * AIAdapters.js
 * Provider-independent adapters for AI and Machine Learning tasks.
 * Currently implemented as stubs for backend-driven processing.
 */

class BaseAdapter {
    async process(file, context) {
        throw new Error("process() must be implemented by subclass");
    }
}

export class GeminiAdapter extends BaseAdapter {
    async process(file, context) {
        // console.log(`[GeminiAdapter] Processing ${file.name}`);
        return { keywords: ['gemini', 'auto-generated'], summary: 'Gemini summary stub.' };
    }
}

export class VisionAdapter extends BaseAdapter {
    async process(file, context) {
        if (!file.type.startsWith('image/')) return null;
        // console.log(`[VisionAdapter] Processing ${file.name}`);
        return { objectsDetected: ['diagram', 'text'] };
    }
}

export class SpeechAdapter extends BaseAdapter {
    async process(file, context) {
        if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) return null;
        // console.log(`[SpeechAdapter] Processing ${file.name}`);
        return { transcript: 'Speech-to-text transcript stub.', language: 'ar' };
    }
}

export class OCRAdapter extends BaseAdapter {
    async process(file, context) {
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') return null;
        // console.log(`[OCRAdapter] Processing ${file.name}`);
        return { extractedText: 'OCR text stub.' };
    }
}

export class SummaryAdapter extends BaseAdapter {
    async process(text, context) {
        if (!text) return null;
        // console.log(`[SummaryAdapter] Summarizing text...`);
        return { aiSummary: 'This is an AI generated summary of the document.' };
    }
}
