export interface Note {
    id: string;
    folderId: string;
    title: string;
    body: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateNoteDto {
    title: string;
    body: string;
    tags: string[];
    folderId: string;
}

export interface UpdateNoteDto {
    title?: string;
    body?: string;
    tags?: string[];
    folderIds: string;
}

export interface DetailedNote extends Note {}


