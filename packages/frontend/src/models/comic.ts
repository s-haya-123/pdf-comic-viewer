export interface Comic {
    id: number;
    author?: string;
    title: string;
    tag?: string[];
    current_page?: number;
    folder_id?: string;
}