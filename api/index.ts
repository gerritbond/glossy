import { handler as createAndUpdateTerm } from "./functions/createAndUpdateTerm";
import { handler as deleteTerm } from "./functions/deleteTerm";
import { handler as getTerm } from "./functions/getTerm";
import { handler as scanTerms } from "./functions/scanTerms";
import { handler as createAndUpdateCategory } from "./functions/createAndUpdateCategory";
import { handler as getCategory } from "./functions/getCategory";
import { handler as scanCategories } from "./functions/scanCategories";
import { handler as deleteCategory } from "./functions/deleteCategory";
import { handler as associateCategoryAndTerm } from "./functions/associateCategoryAndTerm";
import { handler as disassociateCategoryAndTerm } from "./functions/disassociateCategoryAndTerm";
import { handler as queryTermsForCategory } from "./functions/queryTermsForCategory";
import { handler as queryCategoriesForTerm } from "./functions/queryCategoriesForTerm";

export {
	createAndUpdateTerm,
	deleteTerm,
	getTerm,
	scanTerms,
	createAndUpdateCategory,
	getCategory,
	scanCategories,
	deleteCategory,
	associateCategoryAndTerm,
	disassociateCategoryAndTerm,
	queryTermsForCategory,
	queryCategoriesForTerm,
};
