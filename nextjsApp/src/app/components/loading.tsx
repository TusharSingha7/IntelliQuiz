

export default function LoadingUI() {
    return <>
        
        <div role="status" className=" animate-pulse">
            <div className="font-bold text-4xl text-center border-y-2 p-2">Waiting List</div>
            <li className="grid grid-cols-2 text-center text-2xl font-bold p-2 border-b-2">
                <span> Candidate </span>
                <span> Role </span>
            </li>
            <ul className="grid items-center p-2 rounded text-2xl">
                {[...Array(8)].map((_, i) => (
                    <li key={i} className="rounded grid grid-cols-2 text-center mb-2">
                        <span className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-40 mx-auto mb-2.5"></span>
                        <span className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-40 mx-auto mb-2.5"></span>
                    </li>
                ))}
            </ul>
        </div>

    </>
}