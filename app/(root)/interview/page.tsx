import Agent from "@/components/Agent";
import { supabaseBrowserClient } from "@/configs/supabase";
import React from "react";

const Interview = async () => {
  const { data: authData } = await supabaseBrowserClient.auth.getUser();
  const email = authData?.user?.email;

  const { data: userProfile } = await supabaseBrowserClient
    .from("Users")
    .select("name, _id")
    .eq("email", email)
    .maybeSingle();

  return (
    <>
      <h3>Interview Generation</h3>
      <Agent
        userName={userProfile?.name ?? ""}
        userId={userProfile?._id ?? ""}
        type="generate"
      />
    </>
  );
};

export default Interview;
