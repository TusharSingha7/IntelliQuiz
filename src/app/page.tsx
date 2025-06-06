'use client'
import VantaBackground from './components/birdsBack';

export default function Home() {
  return (
    <>
    <VantaBackground value='NET'>
    <div className=" min-h-screen text-white pb-24">
      <div className="flex h-full">
        <div className="min-h-full flex-1 flex flex-col pt-32 pl-20">
          <h1 className='text-5xl text-[#640df2] font-bold border w-fit p-2'>
          AI Driven Quiz
          </h1>
          <p className=' text-2xl pt-10 max-w-xl'>
            Elevate your learning with AI-driven quizzes and 
            multiplayer online modes, designed to make studying 
            smarter and more engaging for students.
          </p>
          <button className='h-10 w-32 bg-blue-600 rounded mt-32 ml-2'>Get Started</button>
        </div>
        <div className=" min-h-full pt-20">
        </div>
      </div>
    </div>
    </VantaBackground>
    </>
    
  );
}
