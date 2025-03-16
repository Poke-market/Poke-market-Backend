import slugify from "slugify";
export function slugifyLowercase(name: string) {
  return slugify(name, { lower: true });
}
