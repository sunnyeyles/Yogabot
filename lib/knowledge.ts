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

  private convertObjectToSections(
    obj: Record<string, unknown>
  ): KnowledgeSection[] {
    const sections: KnowledgeSection[] = [];

    const processObject = (
      data: Record<string, unknown>,
      prefix: string = "",
      priority: number = 5
    ) => {
      if (typeof data === "object" && data !== null && !Array.isArray(data)) {
        for (const [key, value] of Object.entries(data)) {
          const currentPrefix = prefix ? `${prefix} - ${key}` : key;

          if (typeof value === "string") {
            sections.push({
              title: currentPrefix,
              content: value,
              tags: this.extractTags(currentPrefix, value),
              priority: priority,
            });
          } else if (Array.isArray(value)) {
            if (value.every((item) => typeof item === "string")) {
              const content = value.map((item) => `• ${item}`).join("\n");
              sections.push({
                title: currentPrefix,
                content: content,
                tags: this.extractTags(currentPrefix, content),
                priority: priority,
              });

              if (
                key === "guidelines" ||
                key === "purpose" ||
                key === "tone" ||
                key === "style"
              ) {
                value.forEach((item, index) => {
                  sections.push({
                    title: `${currentPrefix} - ${index + 1}`,
                    content: item,
                    tags: this.extractTags(item, item),
                    priority: priority + 2,
                  });
                });
              }
            } else {
              value.forEach((item, index) => {
                if (typeof item === "object" && item !== null) {
                  processObject(
                    item as Record<string, unknown>,
                    `${currentPrefix} ${index + 1}`,
                    priority - 1
                  );
                }
              });
            }
          } else if (typeof value === "object" && value !== null) {
            if (key === "passes_and_prices" || key === "price") {
              this.processPricingData(
                value as Record<string, unknown>,
                currentPrefix,
                sections,
                priority
              );
            } else {
              processObject(
                value as Record<string, unknown>,
                currentPrefix,
                priority - 1
              );
            }
          }
        }
      }
    };

    processObject(obj);
    return sections;
  }

  private processPricingData(
    pricingData: Record<string, unknown>,
    prefix: string,
    sections: KnowledgeSection[],
    priority: number
  ) {
    for (const [itemName, itemData] of Object.entries(pricingData)) {
      if (typeof itemData === "object" && itemData !== null) {
        const data = itemData as Record<string, unknown>;
        let content = "";

        if (data.price) {
          if (typeof data.price === "string") {
            content = `Price: ${data.price}`;
          } else if (typeof data.price === "object") {
            const priceDetails = Object.entries(
              data.price as Record<string, unknown>
            )
              .map(([method, amount]) => `${method}: ${amount}`)
              .join(", ");
            content = `Price: ${priceDetails}`;
          }
        }

        if (data.details) {
          if (typeof data.details === "string") {
            content += `\n\nDetails: ${data.details}`;
          } else if (Array.isArray(data.details)) {
            content += `\n\nDetails:\n${(data.details as string[])
              .map((d: string) => `• ${d}`)
              .join("\n")}`;
          }
        }

        if (data.description) {
          content = `${data.description}\n\n${content}`;
        }

        if (data.notes) {
          content += `\n\nNotes: ${data.notes}`;
        }

        if (content) {
          sections.push({
            title: `${prefix} - ${itemName}`,
            content: content.trim(),
            tags: this.extractTags(itemName, content),
            priority: priority + 1,
          });
        }
      }
    }
  }

  private extractTags(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const tags: string[] = [];

    const keywords = [
      "pricing",
      "classes",
      "schedule",
      "schedules",
      "timetable",
      "timetables",
      "calendar",
      "calendars",
      "booking",
      "beginner",
      "studio",
      "location",
      "address",
      "hours",
      "pass",
      "passes",
      "membership",
      "memberships",
      "injury",
      "equipment",
      "refund",
      "prenatal",
      "therapy",
      "suspension",
      "iyengar",
      "yoga",
      "contact",
      "about",
      "faq",
      "workshop",
      "training",
      "teacher",
      "cost",
      "price",
      "casual",
      "unlimited",
      "pack",
      "weekly",
      "monthly",
      "yearly",
      "online",
      "in-studio",
      "seniors",
      "students",
      "cash",
      "eftpos",
      "credit",
      "debit",
      "guidelines",
      "personality",
      "purpose",
      "direct",
      "calendar",
      "timetables",
      "class times",
      "when are classes",
    ];

    keywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return tags;
  }

  private isValidKnowledgeSection(item: unknown): item is KnowledgeSection {
    if (!item || typeof item !== "object" || item === null) {
      return false;
    }

    const obj = item as Record<string, unknown>;
    return (
      typeof obj.title === "string" &&
      typeof obj.content === "string" &&
      Array.isArray(obj.tags) &&
      typeof obj.priority === "number"
    );
  }

  private loadKnowledge(): KnowledgeBase {
    const sections: KnowledgeSection[] = [];

    const dataDir = path.join(process.cwd(), "data");

    const loadSection = (filePath: string): KnowledgeSection[] => {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(content);

        if (Array.isArray(data)) {
          return data.filter((item) => this.isValidKnowledgeSection(item));
        } else if (typeof data === "object" && data !== null) {
          const convertedSections = this.convertObjectToSections(
            data as Record<string, unknown>
          );
          return convertedSections;
        }

        return [];
      } catch (error) {
        console.warn(`Failed to load ${filePath}:`, error);
        return [];
      }
    };

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
    const queryLower = query.toLowerCase();

    const isScheduleQuery =
      queryLower.includes("schedule") ||
      queryLower.includes("timetable") ||
      queryLower.includes("calendar") ||
      queryLower.includes("class times") ||
      queryLower.includes("when are classes");

    const scoredSections = this.knowledgeBase.sections
      .filter((section) => {
        if (!section || !section.tags || !Array.isArray(section.tags)) {
          return false;
        }

        return (
          section.tags.some((tag) => queryLower.includes(tag.toLowerCase())) ||
          (section.content &&
            section.content.toLowerCase().includes(queryLower)) ||
          (section.title && section.title.toLowerCase().includes(queryLower))
        );
      })
      .map((section) => {
        let score = section.priority || 0;

        if (
          section.title.toLowerCase().includes("bot_personality") ||
          section.title.toLowerCase().includes("bot_purpose") ||
          section.title.toLowerCase().includes("guidelines")
        ) {
          score += 10;
        }

        if (
          isScheduleQuery &&
          section.content
            .toLowerCase()
            .includes("direct students to the online class calendar")
        ) {
          score += 20;
        }

        if (
          isScheduleQuery &&
          (section.content.toLowerCase().includes("retreat") ||
            section.content.toLowerCase().includes("workshop"))
        ) {
          score -= 5;
        }

        return { section, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.section);

    return scoredSections;
  }

  public getAllContent(): string {
    return this.knowledgeBase.sections
      .filter((section) => section && section.title && section.content)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .map((section) => `## ${section.title}\n\n${section.content}`)
      .join("\n\n");
  }

  public getSectionByTag(tag: string): KnowledgeSection[] {
    return this.knowledgeBase.sections.filter(
      (section) =>
        section &&
        section.tags &&
        Array.isArray(section.tags) &&
        section.tags.includes(tag)
    );
  }

  public reload(): void {
    this.knowledgeBase = this.loadKnowledge();
  }
}
