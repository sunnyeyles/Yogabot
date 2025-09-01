import fs from "fs";
import path from "path";

export interface KnowledgeSection {
  title: string;
  content: string;
  tags: string[];
  priority: number;
}

export interface KnowledgeBase {
  sections: KnowledgeSection[];
  metadata: {
    lastUpdated: string;
    version: string;
  };
}

export class KnowledgeManager {
  private knowledgeBase: KnowledgeBase;

  constructor() {
    this.knowledgeBase = this.loadKnowledge();
  }

  private loadKnowledge(): KnowledgeBase {
    const dataDir = path.join(process.cwd(), "data");
    const sections: KnowledgeSection[] = [];

    // Load all JSON files from data directory
    const loadSection = (filePath: string): KnowledgeSection[] => {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(content);
        return Array.isArray(data) ? data : [data];
      } catch (error) {
        console.warn(`Failed to load ${filePath}:`, error);
        return [];
      }
    };

    // Recursively load all JSON files
    const loadDirectory = (dir: string): void => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          loadDirectory(filePath);
        } else if (file.endsWith(".json")) {
          sections.push(...loadSection(filePath));
        }
      }
    };

    if (fs.existsSync(dataDir)) {
      loadDirectory(dataDir);
    }

    return {
      sections,
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: "1.0.0",
      },
    };
  }

  public getRelevantSections(
    query: string,
    limit: number = 5
  ): KnowledgeSection[] {
    // Simple keyword matching - could be enhanced with embeddings
    const queryLower = query.toLowerCase();

    return this.knowledgeBase.sections
      .filter(
        (section) =>
          section.tags.some((tag) => queryLower.includes(tag.toLowerCase())) ||
          section.content.toLowerCase().includes(queryLower) ||
          section.title.toLowerCase().includes(queryLower)
      )
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  public getAllContent(): string {
    return this.knowledgeBase.sections
      .sort((a, b) => b.priority - a.priority)
      .map((section) => `## ${section.title}\n\n${section.content}`)
      .join("\n\n");
  }

  public getSectionByTag(tag: string): KnowledgeSection[] {
    return this.knowledgeBase.sections.filter((section) =>
      section.tags.includes(tag)
    );
  }

  public reload(): void {
    this.knowledgeBase = this.loadKnowledge();
  }
}
