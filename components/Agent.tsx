"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { BackgroundGradient } from "./ui/background-gradient";
import { cn } from "@/utils";
import { useRouter } from "next/navigation";
import hark from "hark";
import { vapi } from "@/lib/vapi.sdk";
import { detectMicrophoneActivities } from "@/lib/microphone-detector";
import { interviewer } from "@/constants";
import { createInterviewFeedback } from "@/functions";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  FINISHED = "FINISHED",
  ACTIVE = "ACTIVE",
}

type SavedMessage = {
  role: "user" | "system" | "assistant";
  content: string;
};
const Agent = ({
  userName,
  userId,
  type,
  questions,
  feedbackId,
  interviewId,
}: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>();
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const lastMessage = messages[messages.length - 1];
  const isCallInactiveOrFinished =
    callStatus == CallStatus.INACTIVE || callStatus == CallStatus.FINISHED;
  const isCallConnecting = callStatus === CallStatus.CONNECTING;
  const audioRef = useRef(new Audio("/audio/ringer.mp3"));
  const audioPlayRef = useRef<Promise<void> | null>(null);

  const handleAudio = (type: "calling" | "picked") => {
    if (type === "calling") {
      audioRef.current.loop = true;
      audioPlayRef.current = audioRef.current.play();
    } else {
      const stop = () => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioPlayRef.current = null;
      };
      audioPlayRef.current
        ? audioPlayRef.current.then(stop).catch(stop)
        : stop();
    }
  };

  const handleGenerateFeedback = async (message: SavedMessage[]) => {
    //generate feedback
    const feedbackResult = await createInterviewFeedback({
      interviewId: interviewId!,
      userId: userId!,
      transcript: messages,
    });
    if (feedbackResult?.success && feedbackResult?.feedbackId) {
      router.push(`/interview/${interviewId}/feedback`);
    } else {
      console.log("something went wrong storing feedback");
      router.push("/");
    }
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    detectMicrophoneActivities(
      () => setIsUserSpeaking(true),
      () => setIsUserSpeaking(false),
    ).then((fn) => {
      cleanup = fn;
    });
    return () => cleanup?.();
  }, []);

  useEffect(() => {
    const onCallStart = () => {
      handleAudio("picked");
      setCallStatus(CallStatus.ACTIVE);
    };
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (message: Message) => {
      if (
        message.type == MessageTypeEnum.TRANSCRIPT &&
        message.transcriptType == TranscriptMessageTypeEnum.FINAL
      ) {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log("error:", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type == "generate") {
        router.push("/");
      } else if (type == "interview" && messages.length > 3) {
        handleGenerateFeedback(messages);
      } else {
        router.back();
      }
    }
  }, [messages, callStatus, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    handleAudio("calling");
    if (type == "generate") {
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          name: userName,
        },
      });
    } else {
      let formattedQuetion = "";
      if (questions) {
        formattedQuetion = questions
          .map((question) => `-${question}`)
          .join("\n");
      }
      await vapi.start(interviewer, {
        variableValues: { questions: formattedQuetion },
      });
    }
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.say("It's fine, see you later", true);
    vapi.stop();
  };

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

          <h3>Zira</h3>
        </div>
        {isUserSpeaking ? (
          <BackgroundGradient className="flex-5 flex h-100 w-125" animate>
            <div className="card-border">
              <div className="card-content w-full">
                <Image
                  src={"/user-avatar-2.jpg"}
                  alt="user-avatar"
                  className="object-cover w-30 h-30 rounded-full"
                  width={300}
                  height={300}
                />
              </div>
            </div>
          </BackgroundGradient>
        ) : (
          <div className="flex flex-5 h-100">
            <div className="card-border">
              <div className="card-content w-full">
                <Image
                  src={"/user-avatar-2.jpg"}
                  alt="user-avatar"
                  className="object-cover w-30 h-30 rounded-full"
                  width={200}
                  height={200}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      {messages?.length > 0 && (
        <div>
          <div className="transcript-border">
            <div className="transcript">
              <p
                key={lastMessage?.content}
                className={cn(
                  "transition-opacity duration-500 opacity-0",
                  "animate-fadeIn opcaity-100",
                )}
              >
                {lastMessage?.content}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus == CallStatus.CONNECTING && "hidden",
              )}
            />
            <span>
              {isCallInactiveOrFinished
                ? "..."
                : isCallConnecting
                  ? "Calling..."
                  : "Call"}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
