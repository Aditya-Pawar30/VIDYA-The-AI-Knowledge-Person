import { Subject } from "../components/Sidebar";

export interface SubjectDetectionResult {
  suggestedName: string;
  matchedExistingSubject?: Subject;
  isNew: boolean;
  confidence: number;
}

const COMMON_SUBJECT_KEYWORDS: Record<string, string[]> = {
  "Natural Language Processing": ["nlp", "nlpa", "natural language", "linguistics", "tokenization", "bert", "gpt", "transformer"],
  "Operating Systems": ["os", "operating system", "process scheduling", "deadlock", "memory management", "virtual memory", "paging"],
  "Machine Learning": ["ml", "machine learning", "deep learning", "neural network", "supervised", "unsupervised", "regression", "svm"],
  "Computer Networks": ["cn", "network", "networking", "tcp", "udp", "ip", "osi", "routing", "socket", "http"],
  "Database Management Systems": ["dbms", "database", "sql", "nosql", "relational", "normalization", "acid", "mongodb"],
  "Data Structures & Algorithms": ["dsa", "data structures", "algorithm", "binary tree", "graph", "dynamic programming", "sorting"],
  "Software Engineering": ["software engineering", "sdlc", "agile", "scrum", "design pattern", "refactoring"],
  "Cloud Computing & DevOps": ["cloud", "aws", "docker", "kubernetes", "devops", "ci/cd", "azure"],
  "Artificial Intelligence": ["ai", "artificial intelligence", "search algorithm", "heuristics", "knowledge representation"],
};

/**
 * Analyzes filename and text to detect subject and match with existing subjects
 */
export function detectSubject(filename: string, existingSubjects: Subject[]): SubjectDetectionResult {
  const clean = filename.toLowerCase();

  // 1. Check if matches any existing user subject by name
  for (const subject of existingSubjects) {
    const subNameClean = subject.name.toLowerCase();
    if (clean.includes(subNameClean) || subNameClean.includes(clean.replace(/\.pdf$/i, ""))) {
      return {
        suggestedName: subject.name,
        matchedExistingSubject: subject,
        isNew: false,
        confidence: 0.9,
      };
    }
  }

  // 2. Check acronyms in filename, e.g. "NLPA - Unit- I Presentation.pptx.pdf" -> NLPA
  const prefixMatch = filename.match(/^([A-Za-z]{2,5})\b/);
  const prefix = prefixMatch ? prefixMatch[1].toUpperCase() : null;

  if (prefix) {
    // Check if any existing subject contains this acronym
    const matchedByPrefix = existingSubjects.find(
      (s) => s.name.toUpperCase().includes(prefix) || prefix.includes(s.name.toUpperCase())
    );
    if (matchedByPrefix) {
      return {
        suggestedName: matchedByPrefix.name,
        matchedExistingSubject: matchedByPrefix,
        isNew: false,
        confidence: 0.85,
      };
    }
  }

  // 3. Check common dictionary keywords
  for (const [subjectName, keywords] of Object.entries(COMMON_SUBJECT_KEYWORDS)) {
    for (const kw of keywords) {
      // Word boundary match
      const regex = new RegExp(`(^|[^a-z0-9])${kw}([^a-z0-9]|$)`, "i");
      if (regex.test(clean)) {
        // Check if user already has this subject
        const existing = existingSubjects.find(
          (s) => s.name.toLowerCase() === subjectName.toLowerCase() ||
                 subjectName.toLowerCase().includes(s.name.toLowerCase())
        );

        if (existing) {
          return {
            suggestedName: existing.name,
            matchedExistingSubject: existing,
            isNew: false,
            confidence: 0.8,
          };
        }

        return {
          suggestedName: prefix ? `${subjectName} (${prefix})` : subjectName,
          isNew: true,
          confidence: 0.75,
        };
      }
    }
  }

  // 4. Fallback: If there's a prefix code like "CS301" or "NLPA"
  if (prefix) {
    return {
      suggestedName: prefix,
      isNew: true,
      confidence: 0.6,
    };
  }

  // Generic fallback
  return {
    suggestedName: "General Studies",
    isNew: true,
    confidence: 0.3,
  };
}
