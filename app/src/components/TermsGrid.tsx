import { Link } from 'react-router-dom';
import { Term } from '#types/Term';

export const TermsGrid = ({ letter, terms }: { letter: string, terms: Array<Term> }) => {
    if (!terms || terms.length === 0) {
        return <></>;
    }
    const fakeTerms = [terms[0], terms[0], terms[0]];
    for (let i = 0; i < 100; i++) {
        fakeTerms.push(terms[Math.floor(Math.random() * terms.length)]);
    }

    terms = fakeTerms;

    return (
        <div id={"collection-" + letter} className="mt-10 grid grid-cols-10 bg-background-color-secondary border border-text-color-primary border-opacity-20 rounded-lg p-6">
            <div className="col-start-1 col-span-1 mb-4 pl-4">
                <span className="text-text-color-highlight text-6xl">{letter}</span>
            </div>
            <div className="col-start-2 col-span-9 grid grid-cols-4 gap-4">
                {terms.slice(0, 32).map((term, index) => (
                    <div 
                        key={index} 
                        className="text-text-color-primary"
                    >
                        <Link to={"/term/" + term.term} className="hover:text-text-color-highlight transition-colors cursor-pointer">{term.term}</Link>
                    </div>
                ))}
                {terms.length > 49 && <div className="col-span-4">
                    <Link to={"/letter/" + letter} className="cursor-pointer rounded-md px-6 py-2 border-text-color-highlight border-2 text-text-color-highlight hover:text-white hover:bg-text-color-highlight">See Full List</Link>
                </div>}
            </div>
        </div>
    );
}; 