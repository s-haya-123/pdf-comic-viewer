export interface Comic {
    id: number;
    author?: string;
    title: string;
    thumbnail?: string;
    pdf?: string;
    tag?: string[];
    current_page?: number;
    folder_id?: string;
}