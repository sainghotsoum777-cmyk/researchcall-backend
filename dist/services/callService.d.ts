export interface SearchParams {
    search?: string;
    type?: string;
    domain?: string;
    country?: string;
    language?: string;
    status?: string;
    deadlineAfter?: string;
    deadlineBefore?: string;
    modality?: string;
    sort?: string;
    page?: number;
    limit?: number;
}
export interface SearchResult {
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
/**
 * Recherche avancée combinant full-text search et filtres SQL
 *
 * Stratégie de recherche :
 * 1. Si query fournie → full-text search tsvector + score de pertinence
 * 2. Fallback trigram si aucun résultat full-text
 * 3. Filtres SQL standard (type, domain, country, etc.)
 * 4. Tri par pertinence, deadline, ou date de création
 */
export declare function searchCalls(params: SearchParams): Promise<SearchResult>;
export declare function getPersonalizedFeed(userId: string, page?: number, limit?: number): Promise<SearchResult>;
export declare function getSearchSuggestions(query: string): Promise<string[]>;
//# sourceMappingURL=callService.d.ts.map