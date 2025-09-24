"use client";
import { useEffect, useState } from "react";
import CreateQuizPopup from "@/components/createQuiz";
import JoinQuizPopup from "@/components/joinQuiz";
import VantaBackground from "@/components/birdsBack";
import { v4 as uuidv4 } from "uuid";
import LoadingUI from "@/components/loading";
import axios from "axios";
import { useRouter } from "next/navigation";
import SubmitFile from "../components/submitFile";

export default function Enter() {
  const [showCreate, setCreate] = useState<boolean>(false);
  const [showFile, setFile] = useState<boolean>(false);
  const [showJoin, setJoin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);
  const router = useRouter();
  useEffect(() => {
    try {
      if (!localStorage.getItem("intelli-quiz-userId")) {
        const id = crypto.randomUUID();
        localStorage.setItem("intelli-quiz-userId", id);
      }
    } catch {
      const id = uuidv4();
      localStorage.setItem("intelli-quiz-userId", id);
    }
    try {
      if (
        localStorage.getItem("intelli-quiz-userId") &&
        localStorage.getItem("username")
      ) {
        const id =
          localStorage.getItem("intelli-quiz-userId") +
          "_" +
          localStorage.getItem("username");
        const response = axios.get(`/api/v2/?userId=${id}`);
        response.then((res) => {
          const data = res.data;
          if (data.code == 1) {
            router.push(`/enter/${data.roomId}`);
          } else setChecking(false);
        });
      } else setChecking(false);
    } catch {
      console.log("error in get api");
    }
  }, [router]);

  if (loading) return <LoadingCompo />;

  if (checking) return <EnterLoading />;

  return (
    <>
      <VantaBackground value="GLOBE">
        {showCreate && <CreateQuizPopup func={setCreate} loader={setLoading} />}
        <div className="grid grid-cols-2 h-screen text-white">
          <div className="flex flex-col gap-4 min-h-screen justify-center">
            <button
              className=" w-64 mx-auto p-4 font-bold border rounded hover:bg-white hover:text-black"
              onClick={() => {
                setFile(true);
              }}
            >
              Generate Quiz From File
            </button>
            <button
              className=" w-64 mx-auto p-4 font-bold border rounded hover:bg-white hover:text-black"
              onClick={() => {
                setCreate(true);
              }}
            >
              Generate Quiz From Prompt
            </button>
            <button
              className=" w-64 mx-auto p-4 font-bold border rounded hover:bg-white hover:text-black"
              onClick={() => {
                setJoin(true);
              }}
            >
              Join Multiplayer Quiz
            </button>
          </div>
          <div className="relative flex flex-col gap-4 min-h-full justify-center items-center"></div>
        </div>
        {showJoin && <JoinQuizPopup func={setJoin} loader={setLoading} />}
        {showFile && <SubmitFile func={setFile} loader={setLoading} />}
      </VantaBackground>
    </>
  );
}

function LoadingCompo() {
  return (
    <>
      <div role="status" className=" animate-pulse flex flex-col">
        <div className="flex">
          <div className="font-bold text-2xl p-2 grow-[6] pr-10 flex justify-end items-center">
            <span>Room Id : *******</span>
          </div>
          <div className=" grow-[4] pr-5 flex justify-end p-2">
            <button className="px-4 border border-black rounded py-2 font-bold shadow-lg mr-2">
              Exit
            </button>
          </div>
        </div>
        <LoadingUI />
      </div>
    </>
  );
}

function EnterLoading() {
  return (
    <>
      <div role="status" className="">
        <div className="grid grid-cols-2 h-screen text-white bg-slate-800 animate-pulse">
          <div className="flex flex-col gap-4 min-h-screen justify-center">
            <button className=" w-64 mx-auto p-4 font-bold border bg-gray-400 animate-pulse">
              Generate Quiz From File
            </button>
            <button className=" w-64 mx-auto p-4 font-bold border bg-gray-400 animate-pulse">
              Generate Quiz From Prompt
            </button>
            <button className=" w-64 mx-auto p-4 font-bold border bg-gray-400 animate-pulse">
              Join Multiplayer Quiz
            </button>
          </div>
          <div className="relative flex flex-col gap-4 min-h-full justify-center items-center"></div>
        </div>
      </div>
    </>
  );
}
