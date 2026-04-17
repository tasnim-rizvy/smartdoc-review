import {
	ChatGoogleGenerativeAI,
	GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/classic/text_splitter';
import { Document as LangchainDoc } from '@langchain/classic/document';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { createStuffDocumentsChain } from '@langchain/classic/chains/combine_documents';
import { RAGResult } from '../types';

const vectorStore = new Map<string, MemoryVectorStore>();

const embeddings = new GoogleGenerativeAIEmbeddings({
	model: 'text-embedding-004',
	apiKey: process.env.GEMINI_API_KEY,
});

const llm = new ChatGoogleGenerativeAI({
	model: 'gemini-2.5-flash',
	apiKey: process.env.GEMINI_API_KEY,
	streaming: true,
	temperature: 0.2,
});

const splitter = new RecursiveCharacterTextSplitter({
	chunkSize: 1000,
	chunkOverlap: 200,
});

export async function indexDocuments(
	documentId: string,
	text: string,
): Promise<void> {
	const chunks = await splitter.createDocuments([text]);
	const docs = chunks.map(
		(chunk, index) =>
			new LangchainDoc({
				pageContent: chunk.pageContent,
				metadata: { documentId, chunkIndex: index },
			}),
	);

	const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
	vectorStore.set(documentId, store);
	console.log(`Indexed document ${documentId} with ${docs.length} chunks.`);
}

export function deleteDocument(documentId: string): void {
	vectorStore.delete(documentId);
}

export async function queryDocuments(
	documentId: string,
	query: string,
): Promise<RAGResult> {
	const store = vectorStore.get(documentId);
	if (!store) {
		throw new Error(`Document with ID ${documentId} not found.`);
	}

	const retriever = store.asRetriever({ k: 5 });
	const relevantDocs = await retriever._getRelevantDocuments(query);

	const prompt = ChatPromptTemplate.fromMessages([
		[
			'system',
			`You are a helpful document assistant. Answer questions based ONLY on the provided document context. If the answer is not in the context, say "I couldn't find that information in this document." Be concise and cite relevant parts of the document when possible.

            Context:
            {context}`,
		],
		['human', '{input}'],
	]);

	const chain = await createStuffDocumentsChain({
		llm,
		prompt,
		outputParser: new StringOutputParser(),
	});

	const stream = await chain.stream({
		input: query,
		context: relevantDocs,
	});

    return {
        stream,
        chunksRetrieved: relevantDocs.length,
    };
}
