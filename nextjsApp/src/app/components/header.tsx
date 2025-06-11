
import Image from "next/image"
import brainImg from '@/public/icons8-brain-64.png'
import Link from "next/link"

export default function Header() {
    return <>
    <div className="min-h-20 bg-[#640df2] shadow-lg shadow-white/40 z-10">
          <div className='flex min-h-full'>
            <div className=' flex-1 flex justify-start items-center pl-5 gap-5'>
              <Image
                src={brainImg}
                placeholder='blur'
                alt='IntelliQuiz Logo'
                width={50}
                height={50}
              ></Image>
              <Link className='text-4xl font-bold text-white' href={'/'}>IntelliQuiz</Link>
            </div>
            <div className='flex-1 flex justify-end gap-5 pr-5 items-center text-white text-xl'>
              <Link href='/home'>Home</Link>
              <Link href='/enter'>Enter</Link>
              <Link href='/dashboard'>Dashboard</Link>
              <Link href='/contact'>Contact</Link>
            </div>
          </div>
        </div>
    </>
}