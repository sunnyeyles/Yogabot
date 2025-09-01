const fs = require("fs");
const path = require("path");

// Read the existing markdown file
const markdownPath = path.join(process.cwd(), "public", "bot-knowledge.md");
const markdownContent = fs.readFileSync(markdownPath, "utf8");

// Parse markdown sections
const sections = [];
const lines = markdownContent.split("\n");
let currentSection = null;
let currentContent = [];

for (const line of lines) {
  if (line.startsWith("## ")) {
    // Save previous section
    if (currentSection) {
      sections.push({
        title: currentSection,
        content: currentContent.join("\n").trim(),
        tags: extractTags(currentSection, currentContent.join("\n")),
        priority: determinePriority(currentSection),
      });
    }

    // Start new section
    currentSection = line.replace("## ", "").trim();
    currentContent = [];
  } else if (currentSection) {
    currentContent.push(line);
  }
}

// Add the last section
if (currentSection) {
  sections.push({
    title: currentSection,
    content: currentContent.join("\n").trim(),
    tags: extractTags(currentSection, currentContent.join("\n")),
    priority: determinePriority(currentSection),
  });
}

// Helper functions
function extractTags(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  const tags = [];

  // Common keywords
  const keywords = [
    "pricing",
    "classes",
    "schedule",
    "booking",
    "beginner",
    "studio",
    "location",
    "hours",
    "pass",
    "membership",
    "injury",
    "equipment",
    "refund",
    "prenatal",
    "therapy",
    "suspension",
    "iyengar",
  ];

  keywords.forEach((keyword) => {
    if (text.includes(keyword)) {
      tags.push(keyword);
    }
  });

  return tags;
}

function determinePriority(title) {
  const titleLower = title.toLowerCase();

  if (titleLower.includes("pricing") || titleLower.includes("pass")) return 10;
  if (titleLower.includes("beginner") || titleLower.includes("class")) return 9;
  if (titleLower.includes("booking") || titleLower.includes("schedule"))
    return 8;
  if (titleLower.includes("studio") || titleLower.includes("location"))
    return 7;
  return 5;
}

// Create data directory structure
const dataDir = path.join(process.cwd(), "data");
const studioDir = path.join(dataDir, "studio");
const classesDir = path.join(dataDir, "classes");
const faqDir = path.join(dataDir, "faq");

[dataDir, studioDir, classesDir, faqDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Categorize and save sections
const studioSections = sections.filter(
  (s) =>
    s.title.toLowerCase().includes("studio") ||
    s.title.toLowerCase().includes("location") ||
    s.title.toLowerCase().includes("hours")
);

const classSections = sections.filter(
  (s) =>
    s.title.toLowerCase().includes("class") ||
    s.title.toLowerCase().includes("pricing") ||
    s.title.toLowerCase().includes("pass")
);

const faqSections = sections.filter(
  (s) =>
    !s.title.toLowerCase().includes("studio") &&
    !s.title.toLowerCase().includes("class") &&
    !s.title.toLowerCase().includes("pricing")
);

// Save categorized data
fs.writeFileSync(
  path.join(studioDir, "info.json"),
  JSON.stringify(studioSections, null, 2)
);

fs.writeFileSync(
  path.join(classesDir, "pricing.json"),
  JSON.stringify(classSections, null, 2)
);

fs.writeFileSync(
  path.join(faqDir, "general.json"),
  JSON.stringify(faqSections, null, 2)
);

console.log("✅ Data migration completed!");
console.log(`📁 Created ${studioSections.length} studio sections`);
console.log(`📁 Created ${classSections.length} class sections`);
console.log(`📁 Created ${faqSections.length} FAQ sections`);
