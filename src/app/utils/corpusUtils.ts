export interface CorpusDocument {
  id: string;
  name: string;
  file?: File;
  subjectId?: string;
  unitNumber: number; // e.g. 1 for Unit 1, 2 for Unit 2
  unitLabel: string;  // e.g. "Unit 1", "Unit 2", or "General"
  totalPages?: number;
  uploadedAt: string;
  sizeBytes?: number;
}

/**
 * Automatically inspects a filename to detect unit / module / chapter keywords
 * e.g., "OS_Unit_1_Processes.pdf" -> Unit 1
 * "CS301-Module-2-Memory.pdf" -> Unit 2
 * "Chapter 3 - Storage.pdf" -> Unit 3
 */
export function detectUnitFromFilename(filename: string): { unitNumber: number; unitLabel: string } {
  const clean = filename.toLowerCase();

  // Match "unit 1", "unit-2", "unit_3", "u1", "u-2", etc.
  const unitMatch = clean.match(/(?:unit|u)[\s_\-]*([0-9]{1,2})/i);
  if (unitMatch && unitMatch[1]) {
    const num = parseInt(unitMatch[1], 10);
    return { unitNumber: num, unitLabel: `Unit ${num}` };
  }

  // Match "module 1", "mod 2"
  const modMatch = clean.match(/(?:module|mod)[\s_\-]*([0-9]{1,2})/i);
  if (modMatch && modMatch[1]) {
    const num = parseInt(modMatch[1], 10);
    return { unitNumber: num, unitLabel: `Module ${num}` };
  }

  // Match "chapter 1", "chap 2", "ch 3"
  const chMatch = clean.match(/(?:chapter|chap|ch)[\s_\-]*([0-9]{1,2})/i);
  if (chMatch && chMatch[1]) {
    const num = parseInt(chMatch[1], 10);
    return { unitNumber: num, unitLabel: `Chapter ${num}` };
  }

  // Match "part 1", "pt 2"
  const partMatch = clean.match(/(?:part|pt)[\s_\-]*([0-9]{1,2})/i);
  if (partMatch && partMatch[1]) {
    const num = parseInt(partMatch[1], 10);
    return { unitNumber: num, unitLabel: `Part ${num}` };
  }

  return { unitNumber: 999, unitLabel: "General Reference" };
}

/**
 * Sorts corpus documents sequentially by Unit (Unit 1, Unit 2, Unit 3...)
 */
export function sortCorpusDocuments(docs: CorpusDocument[]): CorpusDocument[] {
  return [...docs].sort((a, b) => {
    if (a.unitNumber !== b.unitNumber) {
      return a.unitNumber - b.unitNumber;
    }
    return a.name.localeCompare(b.name);
  });
}
