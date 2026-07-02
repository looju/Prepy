import { NextResponse } from "next/server";
import { generateText } from "ai";
import { type GroqLanguageModelChatOptions, createGroq } from "@ai-sdk/groq";
import { getRandomInterviewCover } from "@/utils";
import { supabaseClient } from "@/configs/supabase";
export async function GET() {
  return NextResponse.json(
    {
      success: true,
    },
    { status: 200 },
  );
}

export async function POST(params: Request) {
  const { type, role, level, techstack, amount, userid } = await params.json();
  try {
    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY,
    });
    const model = groq("llama-3.1-8b-instant");

    const { text: results } = await generateText({
      model,
      providerOptions: {
        groq: {
          reasoningFormat: "parsed",
          reasoningEffort: "default",
        } satisfies GroqLanguageModelChatOptions,
      },
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
  
        Thank you! <3
    `,
    });

    const interview = {
      type,
      role,
      level,
      userid,
      techstack: techstack.split(","),
      questions: JSON.parse(results),
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };
    const { data, error } = await supabaseClient
      .from("Interview")
      .insert([interview])
      .select();
    if (!error) {
      return NextResponse.json(
        {
          success: true,
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to store interview",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 },
    );
  }
}
