"use server";
import { supabaseBrowserClient, supabaseClient } from "@/configs/supabase";
import { feedbackSchema, FeedbackSchemaType } from "@/constants";
import { createGroq, GroqLanguageModelChatOptions } from "@ai-sdk/groq";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { toast } from "sonner";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const checkUserExists = async (email: string | undefined) => {
  const { data, error } = await supabaseClient
    .from("Users")
    .select("email")
    .eq("email", email)
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking user:", error);
    return false;
  }

  return !!data;
};

export const SignUpUser = async (params: SignUpParams) => {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: params?.email,
      password: params?.password,
    });
    if (!error) {
      const { error: storageError } = await supabaseClient
        .from("Users")
        .insert([
          {
            _id: params?._id,
            created_at: new Date().toISOString(),
            name: `${params?.name}`,
            image_url: `---`,
            email: `${data?.user?.email}`,
            subscription: false,
            credits: 30,
          },
        ])
        .select();
      if (!storageError) {
        return NextResponse.json({
          status: "success",
          error: "No error",
          statusCode: 200,
        });
      }
    } else {
      return NextResponse.json({
        status: "error",
        error: error?.message || error?.cause,
        statusCode: error?.status || 500,
      });
    }
  } catch (error) {
    return NextResponse.json({
      status: "error",
      error: error || "An unexpected error occured while signin up",
      statusCode: 500,
    });
  }
};

export const SignInUser = async (params: SignInParams) => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: params?.email,
    password: params?.password,
  });
  if (!error) {
    return NextResponse.json({
      status: "success",
      error: "No error",
      statusCode: 200,
    });
  } else {
    return NextResponse.json({
      status: "error",
      error: error || "An unexpected error occured while signing in",
      statusCode: 500,
    });
  }
};

export const checkUser = async () => {
  const user = await supabaseClient.auth.getUser();
  if (!user?.data.user) {
    return NextResponse.json({
      status: "error",
      error: "User not found",
      statusCode: 400,
      user: null,
    });
  } else {
    return NextResponse.json({
      status: "success",
      error: "User found",
      statusCode: 200,
      user: user?.data?.user,
    });
  }
};

export const getScheduledInterviews = async (userId: String) => {
  const { data, error } = await supabaseClient
    .from("Interview")
    .select()
    .eq("userid", userId)
    .order("createdAt", { ascending: false })
    .overrideTypes<GeneratedInterviewProps[]>();
  if (error) {
    console.log("Error getting scheduled interviews of the user:", error);
    return;
  }
  return data;
};

export const getLatestInterviews = async (userId: String, limit?: 20) => {
  const { data, error } = await supabaseClient
    .from("Interview")
    .select()
    .neq("userid", userId)
    .eq("finalized", true)
    .order("createdAt", { ascending: false })
    .limit(limit!)
    .overrideTypes<GeneratedInterviewProps[]>();
  if (error) {
    console.log("Error getting scheduled interviews of the user:", error);
    return;
  }
  return data;
};

export const getInterviewDetailsById = async (Id: String) => {
  const { data, error } = await supabaseClient
    .from("Interview")
    .select()
    .eq("id", Id)
    .single()
    .overrideTypes<GeneratedInterviewProps>();
  if (error) {
    console.log("Error getting interview details by id:", error);
    return;
  }
  return data;
};

export const createInterviewFeedback = async (params: CreateFeedbackParams) => {
  const { interviewId, feedbackId, userId, transcript } = params;
  const feedback_Id = uuidv4();
  const formattedTranscript = transcript.map(
    (transcript) => `-${transcript.role}:${transcript.content}\n`,
  );
  const groq = createGroq({
    apiKey: process.env.GROQ_API_KEY,
  });
  const model = groq("meta-llama/llama-4-scout-17b-16e-instruct");
  try {
    const { text: feedBackResult }: { text: FeedbackSchemaType } =
      await generateText({
        model,
        providerOptions: {
          groq: {
            reasoningFormat: "parsed",
            reasoningEffort: "default",
            structuredOutputs: true,
            strictJsonSchema: true,
          } satisfies GroqLanguageModelChatOptions,
        },
        output: Output.object({
          schema: feedbackSchema,
        }),
        prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
        system:
          "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
      });

    const feedback = {
      createdAt: new Date().toISOString(),
      userId,
      categoryScores: feedBackResult.categoryScores,
      totalScore: feedBackResult.totalScore,
      strengths: feedBackResult.strengths,
      areasForImprovement: feedBackResult.areasForImprovement,
      finalAssessment: feedBackResult?.finalAssessment,
      interviewId,
      feedbackId: feedback_Id,
    };
    const { data, error } = await supabaseClient
      .from("Interview_feedback")
      .insert([feedback])
      .select();

    if (error) {
      console.error(
        "Error occured generating and/or storing interview feedback:",
        error,
      );
    } else {
      return {
        success: true,
        feedbackId: feedback_Id,
      };
    }
  } catch (error) {
    console.log("Error saving feedback:", error);
  }
};

export const getInterviewFeedbackDetailsById = async (
  Id: String,
  userId: string,
) => {
  const { data, error } = await supabaseClient
    .from("Interview_feedback")
    .select()
    .eq("interviewId", Id)
    .eq("userId", userId)
    .single()
    .overrideTypes<InterviewFeedbackDetailsResponse>();
  if (error) {
    console.log("Error getting interview details by id:", error);
    return;
  }
  return data;
};
