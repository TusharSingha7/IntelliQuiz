'use client'
import { mcq_type } from "../lib"

export default function MCQ({props} : {props : mcq_type}){
    return (<>
        <div className="h-full w-full">
            <div className="h-full w-max-200 flex flex-col">
                <div className="text-4xl font-bold">{props.question}</div>
                <div className="text-4xl font-bold">{props.option1}</div>
                <div className="text-4xl font-bold">{props.option2}</div>
                <div className="text-4xl font-bold">{props.option3}</div>
                <div className="text-4xl font-bold">{props.option4}</div>
            </div>
        </div>
    </>)
}