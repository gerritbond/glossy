import type { LogItemExtraInput } from "@aws-lambda-powertools/logger/types";

type DebugLogger = {
	debug: (message: string, ...extraInput: LogItemExtraInput) => void;
};

type Term = {
	term: string;
	definition: string;
	pronunciation: string | null;
	example: string | null;
	relatedTerms: string[];
	isAbbreviation: boolean;
	lastUpdatedAt: string | null;
};

type Category = {
	category: string;
	description: string;
	lastUpdatedAt: string | null;
}

export type { DebugLogger, Term, Category };
