import Agent from "@/components/Agent";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import { supabaseClient } from "@/configs/supabase";
import { getInterviewDetailsById } from "@/functions";
import { getRandomInterviewCover } from "@/utils";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({ params }: RouteParams) => {
  const { id } = await params;
  const interview: GeneratedInterviewProps = await getInterviewDetailsById(id);
  const { data: authData } = await supabaseClient.auth.getUser();
  const email = authData?.user?.email;

  const { data: userProfile } = await supabaseClient
    .from("Users")
    .select("name, _id")
    .eq("email", email)
    .maybeSingle();

  if (!interview) redirect("/");

  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={interview?.coverImage || getRandomInterviewCover()}
              alt="company-logo"
              width={40}
              height={40}
              className="rounded-full size-40 object-cover"
            />
            <h3 className="capitalize">{interview?.role} Interview</h3>
          </div>
          <DisplayTechIcons techStack={interview.techStack} />
        </div>
        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit capitalize">
          {interview.type}
        </p>
      </div>
      <Agent
        userName={userProfile?.name}
        type="interview"
        questions={interview.questions}
        userId={userProfile?._id}
        interviewId={String(interview.id)}
      />
    </>
  );
};

export default Page;
