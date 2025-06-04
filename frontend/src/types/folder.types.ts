export enum FolderAccessLevel {
    READ = "read",
    WRITE = "write",
    OWNER = "owner"
}
export interface Folder {
    id: string;
    owner_id: string;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    access_level: FolderAccessLevel;
}

export interface CreateFolderDto {
    name: string;
    description?: string;
}

export interface UpdateFolderDto {
    name?: string;
    description?: string;
}

