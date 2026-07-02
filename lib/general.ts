import { supabaseClient } from "@/configs/supabase";

export const getUserCredentials = async () => {
  const { data: authData } = await supabaseClient.auth.getUser();
  const email = authData?.user?.email;

  const { data: userProfile } = await supabaseClient
    .from("Users")
    .select("name, _id")
    .eq("email", email)
    .maybeSingle();

  return {
    userProfile,
  };
};
