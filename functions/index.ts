"use server";
import { supabaseBrowserClient, supabaseClient } from "@/configs/supabase";
import { NextResponse } from "next/server";
import { toast } from "sonner";

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
