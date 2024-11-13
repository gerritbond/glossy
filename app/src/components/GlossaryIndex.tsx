const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const AnchorLetter = ({ letter, hasTerms }: { letter: string, hasTerms: boolean }) => {
    const scrollToLetter = (letter:string) => {
        const element = document.getElementById("collection-" + letter);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    return <span className={`
        px-3 py-1
        cursor-pointer
        hover:rounded-3xl  ${hasTerms ? "hover:bg-text-color-highlight  hover:font-extrabold" : ""}`}
        onClick={() => scrollToLetter(letter)}
        >{letter}</span>
}

export const GlossaryIndex = ({ lettersWithTerms }: { lettersWithTerms: string[] }) => {
    return <div className="sticky top-0 flex flex-col items-center justify-center h-full mt-5 bg-background-color-primary">
        <div className="flex flex-row items-stretch justify-between w-full text-text-color-primary text-md py-3">
            {alphabet.map((letter) => 
                <AnchorLetter letter={letter} key={letter} hasTerms={lettersWithTerms.includes(letter)} />
            )}
        </div>
        <hr className="w-full border-gray-700" />
    </div>
}