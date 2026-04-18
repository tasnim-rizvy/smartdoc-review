import {
	ChatGoogleGenerativeAI,
	GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RecursiveCharacterTextSplitter } from '@langchain/classic/text_splitter';
import { Document as LangchainDoc } from '@langchain/classic/document';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RAGResult } from '../types';

const vectorStore = new Map<string, MemoryVectorStore>();

const embeddings = new GoogleGenerativeAIEmbeddings({
	model: 'gemini-embedding-2-preview',
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
	console.log('indexDocuments called with documentId:', documentId, 'text length:', text.length);
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
	console.log(`Indexed document ${documentId} with ${docs.length} chunks. Current store size: ${vectorStore.size}`);
}

export function deleteDocument(documentId: string): void {
	vectorStore.delete(documentId);
}

export async function queryDocuments(
	documentId: string,
	query: string,
): Promise<RAGResult> {
	console.log('queryDocuments called with documentId:', documentId);
	console.log('Current vectorStore keys:', Array.from(vectorStore.keys()));
	const store = vectorStore.get(documentId);
	if (!store) throw new Error(`Document not found.`);

	const retriever = store.asRetriever({ k: 5 });
	const relevantDocs = await retriever.invoke(query);

	const contextText = relevantDocs.map((doc) => doc.pageContent).join('\n\n');

	const prompt = ChatPromptTemplate.fromMessages([
		['system', `You are a helpful document assistant. Answer questions based ONLY on the provided document context. If the answer is not in the context, say "I couldn't find that information in this document."

Context:
{context}`],
		['human', '{input}'],
	]);

	const chain = prompt.pipe(llm).pipe(new StringOutputParser());

	const stream = await chain.stream({
		input: query,
		context: contextText,
	});

	return {
		stream,
		chunksRetrieved: relevantDocs.length,
	};
}
