import { Category } from "./Category";

export type Term = {
    term: string;
    definition: string;
    pronunciation: string | null;
    example: string | null;
    relatedTerms: string[];
    isAbbreviation: boolean;
	lastUpdatedAt: string | null;
    categories: Category[];
};
