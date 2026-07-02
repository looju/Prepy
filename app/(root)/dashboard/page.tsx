import React from "react";
import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import { supabaseBrowserClient } from "@/configs/supabase";
import { getLatestInterviews, getScheduledInterviews } from "@/functions";
import Image from "next/image";
import Link from "next/link";

const Home = async () => {
  const { data: authData } = await supabaseBrowserClient.auth.getUser();
  const email = authData?.user?.email;

  const { data: userProfile } = await supabaseBrowserClient
    .from("Users")
    .select("name, _id")
    .eq("email", email)
    .maybeSingle();

  const [userInterviews, externalInterviews] = await Promise.all([
    await getScheduledInterviews(userProfile?._id),
    await getLatestInterviews(userProfile?._id),
  ]);

  const hasPastInterviews = userInterviews && userInterviews?.length > 0;
  const hasOtherUsersInterviews =
    externalInterviews && externalInterviews.length > 0;
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practive & Feedback</h2>
          <p className="text-lg">
            {" "}
            Practice on real interview questions & get instant feedback
          </p>
          <Button className={"btn-primary max-sm:w-full"}>
            <Link href={"/interview"}>
              <h1>Start an Interview</h1>
            </Link>
          </Button>
        </div>
        <Image
          src={"/robot.png"}
          alt="robot"
          className="max-sm:hidden"
          width={400}
          height={400}
        />
      </section>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews.map((interview, i) => {
              //@ts-ignore
              return <InterviewCard interview={interview} key={i} />;
            })
          ) : (
            <p>You have not yet taken any interviews</p>
          )}
        </div>
      </section>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an interview</h2>
        <div className="interviews-section">
          {hasOtherUsersInterviews ? (
            externalInterviews.map((interview, i) => {
              //@ts-ignore
              return <InterviewCard interview={interview} key={i} />;
            })
          ) : (
            <p>No interviews at the moment</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
