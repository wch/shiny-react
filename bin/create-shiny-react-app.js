#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Available examples with descriptions
const EXAMPLES = [
  {
    id: "1-hello-world",
    name: "Hello World",
    description: "Basic bidirectional communication example",
  },
  {
    id: "2-inputs",
    name: "Input Components",
    description: "Comprehensive input components showcase",
  },
  {
    id: "3-outputs",
    name: "Output Components",
    description: "Data visualization and outputs demo",
  },
  {
    id: "4-messages",
    name: "Server Messages",
    description: "Server-to-client messaging patterns",
  },
  {
    id: "5-shadcn",
    name: "shadcn/ui Components",
    description: "Modern UI with shadcn/ui components",
  },
  {
    id: "6-dashboard",
    name: "Dashboard",
    description: "Dashboard with shadcn/ui components",
  },
  {
    id: "7-chat",
    name: "AI Chat",
    description: "AI chat application with LLM integration",
  },
];

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Error: Template directory not found at ${src}`);
    process.exit(1);
  }

  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    files.forEach((file) => {
      // Skip node_modules and build outputs
      if (file === "node_modules" || file === "www") {
        return;
      }

      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      copyRecursive(srcPath, destPath);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function updatePackageJson(targetDir, appName) {
  const packageJsonPath = path.join(targetDir, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    packageJson.name = appName;
    packageJson.version = "1.0.0";
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function showExamples() {
  console.log("Available templates:");
  console.log("");
  EXAMPLES.forEach((example, index) => {
    console.log(`  ${index + 1}. ${example.name}`);
    console.log(`     ${example.description}`);
    console.log("");
  });
}

function getNextSteps(appName, selectedExample) {
  const steps = [
    `cd ${appName}`,
    "npm install      # This may take a while",
    "npm run watch    # Start development with automatic rebuilds of JavaScript and CSS files",
  ];

  return steps;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.log("Usage: create-shiny-react-app <app-name>");
    console.log("");
    console.log(
      "Creates a new shiny-react application with your choice of template."
    );
    console.log("");
    console.log("Example:");
    console.log("  create-shiny-react-app my-app");
    process.exit(1);
  }

  const appName = args[0];
  const targetDir = path.resolve(appName);

  // Check if target directory already exists
  if (fs.existsSync(targetDir)) {
    console.error(`Error: Directory "${appName}" already exists`);
    process.exit(1);
  }

  const packageDir = path.dirname(__dirname);

  try {
    console.log(`Creating new shiny-react app: ${appName}`);
    console.log("");

    // Show available examples
    showExamples();

    // Get user's template choice
    const templateChoice = await question("Choose a template (1-7) [1]: ");
    const choiceIndex = parseInt(templateChoice || "1") - 1;

    if (choiceIndex < 0 || choiceIndex >= EXAMPLES.length) {
      console.error("Invalid choice. Please select a number between 1 and 7.");
      process.exit(1);
    }

    const selectedExample = EXAMPLES[choiceIndex];
    const templateDir = path.join(packageDir, "examples", selectedExample.id);

    // Ask about CLAUDE.md
    const includeClaude = await question(
      "Include CLAUDE.md for LLM assistance? (y/N): "
    );
    const shouldIncludeClaude =
      includeClaude.toLowerCase() === "y" ||
      includeClaude.toLowerCase() === "yes";

    console.log("");
    console.log(`Template: ${selectedExample.name} (${selectedExample.id})`);
    console.log(`Target: ${targetDir}`);
    if (shouldIncludeClaude) {
      console.log("Including: CLAUDE.md");
    }
    console.log("");

    // Copy the selected template
    copyRecursive(templateDir, targetDir);

    // Update package.json with the new app name
    updatePackageJson(targetDir, appName);

    // Copy CLAUDE.md template if requested
    if (shouldIncludeClaude) {
      const claudeTemplatePath = path.join(
        packageDir,
        "examples",
        "CLAUDE.md.template"
      );
      const claudeDestPath = path.join(targetDir, "CLAUDE.md");

      if (fs.existsSync(claudeTemplatePath)) {
        // Read template and customize it with app name
        let claudeContent = fs.readFileSync(claudeTemplatePath, "utf8");
        claudeContent = claudeContent.replace(/hello-world-app/g, appName);
        fs.writeFileSync(claudeDestPath, claudeContent);
      }
    }

    console.log("✅ App created successfully!");
    console.log("");
    console.log("Next steps:");

    const nextSteps = getNextSteps(appName, selectedExample);
    nextSteps.forEach((step) => console.log(`  ${step}`));

    console.log("");
    console.log("Then in another terminal:");
    console.log("  # For R backend:");
    console.log(
      `  R -e "options(shiny.autoreload = TRUE); shiny::runApp('r/app.R', port=8000)"`
    );
    console.log("");
    console.log("  # For Python backend:");
    console.log(`  shiny run py/app.py --port 8000 --reload`);
    console.log("");
    console.log("Open http://localhost:8000 in your browser");

    if (selectedExample.id === "7-chat") {
      console.log("");
      console.log("📝 Note: The AI chat example requires LLM API keys.");
      console.log("   See the README.md for setup instructions.");
    }
  } catch (error) {
    console.error("Error creating app:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
