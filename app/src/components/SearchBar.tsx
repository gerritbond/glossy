import SearchIcon from '@mui/icons-material/Search';

export const MiniSearchBar = () => {
    return <div className="flex items-center justify-center text-black">
        <div className="relative flex items-center justify-center w-full text-sm">
            <SearchIcon className="absolute left-2 top-3.5 z-10 text-black" />
            <input type="text" placeholder="What word are you looking for?" 
                className="w-96 p-4 pl-10 rounded-md bg-white text-black placeholder:text-black" />
        </div>
    </div>
}

export const SearchBar = () => {
    return <div className="flex items-center justify-center text-black mt-5">
        <div className="relative flex items-center justify-center w-full text-sm">
            <div className="relative w-1/2">
                <SearchIcon className="absolute left-2 top-3.5 z-10 text-black" />
                <input type="text" placeholder="What word are you looking for?" 
                    className="w-full p-4 pl-10 rounded-md bg-white text-black placeholder:text-black" />
            </div>
        </div>
    </div>
}