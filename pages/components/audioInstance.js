import { React, useState, useEffect } from 'react';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

export const audioInstance = async (corpus) => {

    // chat instance
    const chat = new ChatOpenAI({
        temperature: 0.8,
        model: "gpt-4o",
        openAIApiKey: "sk-proj-7RBd6mycLx97qkyRjbE8T3BlbkFJ43ZHM1jXuWNvTToW4CGJ"
    });

    // create a map parser based on output requirements
    const mapSchema = z.object({
        nodes : z.array(z.object({
            entity: z.string(),
            description: z.string()
        })),
        links: z.array(z.object({
            source : z.string(),
            target : z.string()
        }))
    });
    const mapParser = StructuredOutputParser.fromZodSchema(mapSchema);

    // chain purpose: convert the text into nodes/sources and create a hashmap
    const chain_one = ChatPromptTemplate.fromTemplate(
        "{system_prompt}. \n {format_instructions} \n text : {text_to_parse}"
    ).pipe(chat).pipe(mapParser);

    const response = await chain_one.invoke({
        system_prompt: "I need you to analyze the following text and generate a list of connections between nodes that represent ideas. Each node should represent a distinct idea or concept mentioned in the text. Nodes should be connected if there is a relevant relationship or connection between them.",
        format_instructions: mapParser.getFormatInstructions(),
        text_to_parse: corpus
    })

    return response;
}
