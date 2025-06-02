export class NoteDetailResDto {
  id: string;
  tags: string[];
  title: string;
  body: string;
  folder_id: string;
  created_at: Date;
  updated_at: Date;

  constructor(
    id: string,
    tags: string[],
    title: string,
    body: string,
    folder_id: string,
    created_at: Date,
    updated_at: Date,
  ) {
    this.id = id;
    this.tags = tags;
    this.title = title;
    this.body = body;
    this.folder_id = folder_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
