import Link from 'next/link';
import Image from 'next/image';
import img from '@/public/vercel.svg'

export default function Footer() {
    return <>
        <div className="min-h-32 bg-black flex flex-col justify-between text-white">
            <div className="flex ">
                <div className="flex-1 pl-6 pt-6">
                    <h1 className='text-2xl font-bold'>IntelliQuiz</h1>
                    <p>Elevate your learning with AI-driven quizzes.</p>
                </div>
                <div className="flex flex-1 pt-10 justify-around">
                    <Link href=''>Home</Link>
                    <Link href=''>Feature</Link>
                    <Link href=''>About Us</Link>
                    <Link href=''>Contact</Link>
                </div>
                <div className="flex flex-1 justify-end gap-5 pt-10 pr-6">
                    <Link href=''>
                    <Image
                        src={img}
                        alt='Social Media Icon'
                        width={30}
                        height={30}
                    ></Image></Link>
                    <Link href=''><Image
                        src={img}
                        alt='Social Media Icon'
                        width={30}
                        height={30}
                    ></Image></Link>
                    <Link href=''><Image
                        src={img}
                        alt='Social Media Icon'
                        width={30}
                        height={30}
                    ></Image></Link>
                    <Link href=''><Image
                        src={img}
                        alt='Social Media Icon'
                        width={30}
                        height={30}
                    ></Image></Link>
                </div>
            </div>
            <div className='mx-auto'>
                <h1>© 2025 IntelliQuiz. All rights reserved.</h1>
                <p className='pl-7'>Made with ❤️ by Tushar Singh</p>
            </div>
        </div>
    </>
}