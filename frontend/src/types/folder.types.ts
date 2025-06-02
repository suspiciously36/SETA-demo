export interface Folder {
    id: string;
    owner_id: string;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateFolderDto {
    name: string;
    description?: string;
}

export interface UpdateFolderDto {
    name?: string;
    description?: string;
}

