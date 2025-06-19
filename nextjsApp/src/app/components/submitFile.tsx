'use client'
import React from "react";
import {Input} from '@/src/components/ui/input'
import {Label} from '@/src/components/ui/label'
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Dispatch, SetStateAction } from "react";


export default function SubmitFile({func , loader} : {
    func : Dispatch<SetStateAction<boolean>>,
    loader : Dispatch<SetStateAction<boolean>>
}) {

    const submitHandler = (e : React.FormEvent) => {
        e.preventDefault();
        loader(true);
    }

    return <>
    <div className="z-20 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 bg-white rounded shadow shadow-lg h-[70%] w-[50%] flex items-center justify-center">
        <div className="flex flex-col">
            <form onSubmit={submitHandler} className="">
            <div className="grid w-full max-w-sm items-center mb-4">
                <Label htmlFor="File" className="py-2">File</Label>
                <Input id="File" type="file" accept="application/pdf" />
                <Label htmlFor="textarea" className="py-2 mt-2">Note</Label>
                <Textarea id="textarea" className="mb-4" placeholder="Additional Instructions"/>
            </div>
            <Button variant={"ghost"} type="submit" name="button" className="border w-72 shadow bg-black text-white font-bold h-10 rounded">Generate</Button>
        </form>
        </div>
    </div>
    <div onClick={()=>{
        func(false);
    }} className="z-10 opacity-50 h-full w-full fixed bg-gray-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

    </div>
    </>
}
