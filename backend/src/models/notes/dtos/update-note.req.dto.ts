export class UpdateNoteReqDto {
  tags: string[];
  title: string;
  body: string;

  constructor(tags: string[], title: string, body: string) {
    this.tags = tags;
    this.title = title;
    this.body = body;
  }
}
