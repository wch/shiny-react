#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

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

function main() {
  const args = process.argv.slice(2);

  if (args.length !== 1) {
    console.log("Usage: create-shiny-react-app <app-name>");
    console.log("");
    console.log(
      "Creates a new shiny-react application using the 1-hello-world template."
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

  // Find the shiny-react package directory
  const packageDir = path.dirname(__dirname);
  const templateDir = path.join(packageDir, "examples", "1-hello-world");

  console.log(`Creating new shiny-react app: ${appName}`);
  console.log(`Template: ${templateDir}`);
  console.log(`Target: ${targetDir}`);
  console.log("");

  try {
    // Copy the template
    copyRecursive(templateDir, targetDir);

    // Update package.json with the new app name
    updatePackageJson(targetDir, appName);

    console.log("✅ App created successfully!");
    console.log("");
    console.log("Next steps:");
    console.log(`  cd ${appName}`);
    console.log("  npm install");
    console.log("  npm run watch    # Start development with hot reload");
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
  } catch (error) {
    console.error("Error creating app:", error.message);
    process.exit(1);
  }
}

main();
