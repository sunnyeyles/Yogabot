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

  // Convert object data to knowledge sections
  private convertObjectToSections(
    obj: any,
    fileName: string
  ): KnowledgeSection[] {
    const sections: KnowledgeSection[] = [];

    const processObject = (
      data: any,
      prefix: string = "",
      priority: number = 5
    ) => {
      if (typeof data === "object" && data !== null && !Array.isArray(data)) {
        for (const [key, value] of Object.entries(data)) {
          const currentPrefix = prefix ? `${prefix} - ${key}` : key;

          if (typeof value === "string") {
            // Convert string values to sections
            sections.push({
              title: currentPrefix,
              content: value,
              tags: this.extractTags(currentPrefix, value),
              priority: priority,
            });
          } else if (Array.isArray(value)) {
            // Convert array values to sections
            if (value.every((item) => typeof item === "string")) {
              // For arrays of strings, create a section with all items
              const content = value.map((item) => `• ${item}`).join("\n");
              sections.push({
                title: currentPrefix,
                content: content,
                tags: this.extractTags(currentPrefix, content),
                priority: priority,
              });

              // Also create individual sections for each item if it's important
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
                    priority: priority + 2, // Higher priority for bot personality items
                  });
                });
              }
            } else {
              // Recursively process array items
              value.forEach((item, index) => {
                if (typeof item === "object" && item !== null) {
                  processObject(
                    item,
                    `${currentPrefix} ${index + 1}`,
                    priority - 1
                  );
                }
              });
            }
          } else if (typeof value === "object" && value !== null) {
            // Special handling for pricing information
            if (key === "passes_and_prices" || key === "price") {
              this.processPricingData(value, currentPrefix, sections, priority);
            } else {
              // Recursively process nested objects
              processObject(value, currentPrefix, priority - 1);
            }
          }
        }
      }
    };

    processObject(obj);
    return sections;
  }

  // Special method to handle pricing data
  private processPricingData(
    pricingData: any,
    prefix: string,
    sections: KnowledgeSection[],
    priority: number
  ) {
    for (const [itemName, itemData] of Object.entries(pricingData)) {
      if (typeof itemData === "object" && itemData !== null) {
        const data = itemData as any; // Type assertion for dynamic access
        let content = "";
        let tags = ["pricing", "pass", "membership"];

        // Handle different pricing structures
        if (data.price) {
          if (typeof data.price === "string") {
            content = `Price: ${data.price}`;
          } else if (typeof data.price === "object") {
            const priceDetails = Object.entries(data.price)
              .map(([method, amount]) => `${method}: ${amount}`)
              .join(", ");
            content = `Price: ${priceDetails}`;
          }
        }

        if (data.details) {
          if (typeof data.details === "string") {
            content += `\n\nDetails: ${data.details}`;
          } else if (Array.isArray(data.details)) {
            content += `\n\nDetails:\n${data.details
              .map((d: any) => `• ${d}`)
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
            priority: priority + 1, // Higher priority for pricing info
          });
        }
      }
    }
  }

  // Extract tags from title and content
  private extractTags(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const tags: string[] = [];

    // Common keywords for yoga studio
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

  // Validate if an object is a valid knowledge section
  private isValidKnowledgeSection(item: any): item is KnowledgeSection {
    return (
      item &&
      typeof item.title === "string" &&
      typeof item.content === "string" &&
      Array.isArray(item.tags) &&
      typeof item.priority === "number"
    );
  }

  private loadKnowledge(): KnowledgeBase {
    const dataDir = path.join(process.cwd(), "data");
    const sections: KnowledgeSection[] = [];

    // Load all JSON files from data directory
    const loadSection = (filePath: string): KnowledgeSection[] => {
      try {
        const content = fs.readFileSync(filePath, "utf8");
        const data = JSON.parse(content);

        // Handle different JSON structures
        if (Array.isArray(data)) {
          // If it's already an array, validate each item
          return data.filter((item) => this.isValidKnowledgeSection(item));
        } else if (typeof data === "object" && data !== null) {
          // If it's an object, convert it to knowledge sections
          const convertedSections = this.convertObjectToSections(
            data,
            path.basename(filePath, ".json")
          );
          console.log(
            `Loaded ${convertedSections.length} sections from ${filePath}`
          );
          return convertedSections;
        }

        return [];
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

    console.log(`Total sections loaded: ${sections.length}`);
    console.log(
      `Sample sections:`,
      sections.slice(0, 3).map((s) => ({ title: s.title, tags: s.tags }))
    );

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

    // Check if this is a schedule-related query
    const isScheduleQuery =
      queryLower.includes("schedule") ||
      queryLower.includes("timetable") ||
      queryLower.includes("calendar") ||
      queryLower.includes("class times") ||
      queryLower.includes("when are classes");

    // Get all sections and score them
    const scoredSections = this.knowledgeBase.sections
      .filter((section) => {
        // Add safety checks for missing properties
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

        // Boost bot personality and purpose sections
        if (
          section.title.toLowerCase().includes("bot_personality") ||
          section.title.toLowerCase().includes("bot_purpose") ||
          section.title.toLowerCase().includes("guidelines")
        ) {
          score += 10;
        }

        // For schedule queries, prioritize sections that mention directing to calendar/timetables
        if (
          isScheduleQuery &&
          section.content
            .toLowerCase()
            .includes("direct students to the online class calendar")
        ) {
          score += 20;
        }

        // For schedule queries, deprioritize sections about specific events/retreats
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
