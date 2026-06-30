import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import { dummyInterviews } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Home = () => {
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
          {dummyInterviews.map((interview, i) => {
            return <InterviewCard interview={interview} key={i} />;
          })}
        </div>
      </section>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an interview</h2>
        <div className="interviews-section">
          {dummyInterviews.map((interview, i) => {
            return <InterviewCard interview={interview} key={i} />;
          })}
        </div>
      </section>
    </>
  );
};

export default Home;
