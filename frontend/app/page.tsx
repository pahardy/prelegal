import { readFile } from "node:fs/promises";
import { join } from "node:path";
import NdaCreator from "@/components/NdaCreator";

const TEMPLATES_DIR = join(process.cwd(), "..", "templates");

export default async function Home() {
  const [coverPage, standardTerms] = await Promise.all([
    readFile(join(TEMPLATES_DIR, "Mutual-NDA-coverpage.md"), "utf8"),
    readFile(join(TEMPLATES_DIR, "Mutual-NDA.md"), "utf8"),
  ]);
  return <NdaCreator coverPage={coverPage} standardTerms={standardTerms} />;
}
