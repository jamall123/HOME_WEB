/**
 * AIProcessingEngine.js
 * Automatically processes uploaded resources through a pipeline of AI Adapters.
 * Metadata is stored separately from the original file in Firestore.
 */

import { GeminiAdapter, VisionAdapter, SpeechAdapter, OCRAdapter, SummaryAdapter } from './AIAdapters.js';
import { OfflineSyncEngine } from './OfflineSyncEngine.js';
import { SearchIndexer } from './SearchIndexer.js';

export class AIProcessingEngineClass {
    constructor() {
        this.adapters = {
            gemini: new GeminiAdapter(),
            vision: new VisionAdapter(),
            speech: new SpeechAdapter(),
            ocr: new OCRAdapter(),
            summary: new SummaryAdapter()
        };
    }

    async processResource(resourceDoc, originalFile) {
        // console.log(`[AIProcessingEngine] Starting pipeline for ${resourceDoc.resourceId}`);
        
        let metadata = {
            resourceId: resourceDoc.resourceId,
            courseId: resourceDoc.courseId,
            processedAt: Date.now(),
            keywords: [],
            extractedText: '',
            transcript: '',
            aiSummary: ''
        };

        try {
            // 1. OCR for Images / PDF
            const ocrResult = await this.adapters.ocr.process(originalFile, resourceDoc);
            if (ocrResult && ocrResult.extractedText) {
                metadata.extractedText = ocrResult.extractedText;
            }

            // 2. STT for Audio / Video
            const sttResult = await this.adapters.speech.process(originalFile, resourceDoc);
            if (sttResult && sttResult.transcript) {
                metadata.transcript = sttResult.transcript;
            }

            // 3. Vision for Images
            const visionResult = await this.adapters.vision.process(originalFile, resourceDoc);
            if (visionResult && visionResult.objectsDetected) {
                metadata.keywords.push(...visionResult.objectsDetected);
            }

            // 4. Summarization based on extracted text or transcript
            const textToSummarize = metadata.extractedText || metadata.transcript;
            if (textToSummarize) {
                const summaryResult = await this.adapters.summary.process(textToSummarize, resourceDoc);
                if (summaryResult && summaryResult.aiSummary) {
                    metadata.aiSummary = summaryResult.aiSummary;
                }
            }

            // 5. Generic Gemini Metadata (Tags/Keywords)
            const geminiResult = await this.adapters.gemini.process(originalFile, resourceDoc);
            if (geminiResult && geminiResult.keywords) {
                metadata.keywords.push(...geminiResult.keywords);
            }

            // De-duplicate keywords
            metadata.keywords = [...new Set(metadata.keywords)];

            // Save to separate Firestore collection
            await OfflineSyncEngine.queueOperation('resource_ai_metadata', resourceDoc.resourceId, 'set', metadata);

            // Index for Offline Search
            await SearchIndexer.indexResource({
                ...resourceDoc,
                aiKeywords: metadata.keywords,
                ocrText: metadata.extractedText,
                speechText: metadata.transcript
            });

            // console.log(`[AIProcessingEngine] Completed processing for ${resourceDoc.resourceId}`);
        } catch (error) {
            console.error(`[AIProcessingEngine] Pipeline failed for ${resourceDoc.resourceId}`, error);
        }
    }
}
export const AIProcessingEngine = new AIProcessingEngineClass();
