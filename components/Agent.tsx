"use client";
import Image from "next/image";
import React from "react";
import { BackgroundGradient } from "./ui/background-gradient";
import { cn } from "@/utils";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  FINISHED = "FINISHED",
  ACTIVE = "ACTIVE",
}
const Agent = ({ userName }: AgentProps) => {
  const isSpeaking = true;
  const currentCallStatus: CallStatus = CallStatus.CONNECTING;
  const messages = ["whast your name", "My name is john Doe"];
  const lastMessage = messages[messages.length - 1];

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src={"/ai-avatar.png"}
              alt="vapi"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>

          <h3>AI Interviewer</h3>
        </div>
        <BackgroundGradient className="w-full flex-1 flex h-100">
          <div className="card-border">
            <div className="card-content w-full">
              <Image
                src={"/user-avatar.png"}
                alt="user-avatar"
                className="rounded-full object-contain size-30 w-1/2 h-full"
                width={300}
                height={300}
              />
            </div>
          </div>
        </BackgroundGradient>
      </div>
      <div>
        {messages?.length > 0 && (
          <div className="transcript-border">
            <div className="transcript">
              <p
                key={lastMessage}
                className={cn(
                  "transition-opacity duration-500 opacity-0",
                  "animate-fadeIn opcaity-100",
                )}
              >
                {lastMessage}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="w-full flex justify-center">
        {currentCallStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call">
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                currentCallStatus == CallStatus.CONNECTING && "hidden",
              )}
            />
            <span>
              {currentCallStatus == CallStatus.INACTIVE ||
              currentCallStatus == CallStatus.FINISHED
                ? "Call"
                : "..."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect">End</button>
        )}
      </div>
    </>
  );
};

export default Agent;
