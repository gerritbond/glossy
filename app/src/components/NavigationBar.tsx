import { MiniSearchBar } from "#components/SearchBar";
import { Link } from "react-router-dom";
export const NavigationBar = () => {
    return <div className="flex justify-between p-6">
        <Link to="/" className="text-2xl font-bold text-text-color-primary font-dm-serif-display">The Glossary</Link>
        <MiniSearchBar />
    </div>
}