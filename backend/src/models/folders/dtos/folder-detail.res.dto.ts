export class FolderDetailResDto {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;

  constructor(folder: any) {
    this.id = folder.id;
    this.name = folder.name;
    this.description = folder.description;
    this.owner_id = folder.owner_id;
    this.created_at = folder.created_at;
    this.updated_at = folder.updated_at;
  }
}
