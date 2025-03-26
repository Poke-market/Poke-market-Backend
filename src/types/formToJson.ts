export class formToJSON {
  private jsonObject = {} as Record<string, object | string>;
  constructor(private formData: FormData) {}

  get(field: string, options: { as?: string } = {}) {
    const value = this.formData.get(field)?.valueOf();
    if (!value) {
      return this;
    }
    const key = options.as ?? field;
    this.jsonObject[key] = value;
    return this;
  }

  getFile(field: string) {
    return this.formData.get(field) as File;
  }
  returnJson() {
    return this.jsonObject;
  }
}
