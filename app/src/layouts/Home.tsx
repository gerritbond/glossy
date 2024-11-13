import { WelcomeBanner } from "#components/WelcomeBanner";
import { GlossaryIndex } from "#components/GlossaryIndex";
import { SearchBar } from "#components/SearchBar";
import { TermsGrid } from "#components/TermsGrid";
import sampleTerms from "#fixtures/sample-terms.json";

const sortTermsByFirstLetter = (terms: Array<{ term: string }>) => {
    return terms.reduce((acc: { [key: string]: Array<{ term: string }> }, term) => {
        const letter = term.term[0].toUpperCase();
        if (!acc[letter]) {
            acc[letter] = [];
        }
        acc[letter].push(term);
        return acc;
    }, {});
};

export const Home = () => {
    const termsByLetter = sortTermsByFirstLetter(sampleTerms);
    const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const lettersWithTerms = alphabet.filter((letter) => termsByLetter[letter]);


    return (
        <div className="grid grid-cols-8">
            <div className="grid col-span-6 col-start-2 bg-background-color-primary">
                <WelcomeBanner />
                <SearchBar />
                <GlossaryIndex lettersWithTerms={lettersWithTerms} />

                {alphabet.map((letter) => (
                    <TermsGrid letter={letter} terms={termsByLetter[letter]} key={letter} />
                ))}
            </div>
        </div>
    );
};
