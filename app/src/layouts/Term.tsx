import { useParams } from "react-router-dom";
import { NavigationBar } from "#components/NavigationBar.js";
import { Link } from "react-router-dom";

import { Term } from "#types/Term";
import { getTerm } from "#api/glossary";

export const TermLayout = () => {
    const { term } = useParams();
    const termDetails: Term = getTerm(term);
    return (
        <div className="min-h-screen bg-navy-900 text-white">
            <NavigationBar />

            <nav className="px-6 py-4 mt-12">
                <div className="text-gray-400">
                    <Link to="/">Home</Link>
                    <span className="mx-2">›</span>
                    <span>{term}</span>
                </div>
            </nav>

            <main className="px-6 py-8">
                <h1 className="text-5xl font-dm-serif-display mb-6">{term}</h1>
                <div className="max-w-3xl space-y-4 text-gray-300 leading-relaxed">
                    <p>{termDetails.definition}</p>
                </div>
            </main>
        </div>
    );
}