'use client'
import React, { useEffect, useState } from "react";
import {Input} from '@/src/components/ui/input'
import {Label} from '@/src/components/ui/label'
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Dispatch, SetStateAction } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SubmitFile({func , loader} : {
    func : Dispatch<SetStateAction<boolean>>,
    loader : Dispatch<SetStateAction<boolean>>
}) {
    const [username,setUsername] = useState<string>("");
    const [isFileValid , setIsFileValid] = useState<boolean>(true);
    const [fileError , setFileError] = useState<string>("");
    const router = useRouter();
    const submitHandler = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        loader(true);
        if(username.length < 1) {
            alert("invalid username");
            loader(false);
            return;
        }
        localStorage.setItem('username',username);
        const formData = new FormData();
        const target = e.target as HTMLFormElement;
        const fileInput = target.file as HTMLInputElement;
        const textInput = target.textarea as HTMLTextAreaElement
        const text = textInput.value;
        if (fileInput && fileInput.files && fileInput.files[0]) {
            formData.append("file", fileInput.files[0]);
        }
        const userId = localStorage.getItem("intelli-quiz-userId");
        formData.append("text",text);
        formData.append("username",username);
        formData.append("userId",userId || "");
        try {
            const response = await axios.post('/api/v1',formData);
            console.log(response);
            if(response && response.data) {
                router.push(`/enter/${response.data.roomId}`)
            }
            else {
                loader(false);
                alert("Request failed");
            }
        }catch(error) {
            loader(false);
            alert(error);
            console.log(error);
        }
        
    }

    useEffect(()=>{
        setUsername(localStorage.getItem('username') || "");
    },[])

    return <>
    <div className="z-20 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 bg-white rounded shadow shadow-lg h-[70%] w-[50%] flex items-center justify-center">
        <div className="flex flex-col">
            <form onSubmit={submitHandler} encType="multipart/form-data">
                <div className="grid w-full max-w-sm items-center mb-4">
                    <Label htmlFor="username" className="py-2">Username</Label>
                    <Input id="username" placeholder="Engineer" defaultValue={localStorage.getItem('username') || ""} required={true} className="border w-72 rounded shadow font-bold p-2 my-2" onChange={(e)=>{setUsername(e.target.value)}}></Input>
                    <Label htmlFor="File" className="py-2">File</Label>
                    <Input id="file" type="file" accept=".pdf , .docx" name="file" required={true} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const allowedTypes = [
                            "application/pdf",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            ];

                            const sizeInMB = file.size / (1024 * 1024);
                            const isValidType = allowedTypes.includes(file.type);

                            if (!isValidType) {
                            setFileError("Only .pdf and .docx files are allowed");
                            setIsFileValid(false);
                            } else if (sizeInMB > 2) {
                            setFileError("File size exceeds 2MB limit");
                            setIsFileValid(false);
                            } else {
                            setFileError("");
                            setIsFileValid(true);
                            }
                        }
                        }}
                    />
                    {!isFileValid && (<div className="text-red-400">{fileError}</div>)}
                    <Label htmlFor="textarea" className="py-2 mt-2">Note</Label>
                    <Textarea id="textarea" name="textarea" className="mb-4" placeholder="Additional Instructions"/>
                </div>
            <Button variant={"ghost"} disabled={!isFileValid} type="submit" name="button" className="border w-72 shadow bg-black text-white font-bold h-10 rounded">Generate</Button>
        </form>
        </div>
    </div>
    <div onClick={()=>{
        func(false);
    }} className="z-10 opacity-50 h-full w-full fixed bg-gray-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

    </div>
    </>
}
