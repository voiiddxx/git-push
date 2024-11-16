#!/usr/bin/env node

const simpleGit = require("simple-git");
const { program } = require("commander");
const fs = require("fs");
const path = require("path");

const git = simpleGit();

const getConfigPath = () => {
  const repoRoot = process.cwd();
  return path.join(repoRoot, ".push-config.json");
};

program
  .command("set-branch <branch>")
  .description(
    "Set the default branch to push changes to in the current codebase"
  )
  .action((branch) => {
    const configPath = getConfigPath();
    const config = { branch };

    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(`Default branch set to: ${branch}`);
    } catch (error) {
      console.error(`Failed to write config file: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command("push [message]")
  .description("Push changes to the default branch in the current codebase")
  .action(async (message) => {
    const configPath = getConfigPath();

    if (!fs.existsSync(configPath)) {
      console.error('Error: No default branch set. Run "set-branch" first.');
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const branch = config.branch;
    const commitMessage = message || "Commit from flow";

    try {
      
        await git.add(".");
      console.log("Changes staged for commit.");

      await git.commit(commitMessage);
      console.log("Changes committed.");

      await git.push("origin", branch);

      console.log(`Changes pushed to ${branch}.`);

    } catch (err) {
      console.error("Git action failed:", err.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
