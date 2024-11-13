import { Term } from "#types/Term.js";
import termsData from "#fixtures/sample-terms.json";
const terms = termsData as Term[];



export const getTerm = (searchTerm: string): Term => {
    const termDetails = terms.find(t => t.term === searchTerm);
    const term: Term = {
        term: termDetails?.term ?? "",
        definition: termDetails?.definition ?? "",
        pronunciation: termDetails?.pronunciation ?? "",
        example: termDetails?.example ?? "",
        relatedTerms: termDetails?.relatedTerms ?? [],
        isAbbreviation: termDetails?.isAbbreviation ?? false,
        lastUpdatedAt: termDetails?.lastUpdatedAt ?? "",
        categories: termDetails?.categories ?? []
    }


    if (!termDetails) {
        throw new Error("Term not found");
    }

    return term;
}
