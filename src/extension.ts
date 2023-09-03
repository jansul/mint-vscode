import * as cmd from "./commands";
import * as handlers from "./handlers";
import * as vscode from "vscode";

import { MintFormattingProvider } from "./formatter";
import { MintContext } from "./context";

let ctx: MintContext;

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const statusItem = vscode.languages.createLanguageStatusItem("mint.ls", [
    "mint",
  ]);

  context.subscriptions.push(handlers.onDidChangeConfiguration());
  context.subscriptions.push(statusItem);

  ctx = new MintContext(context, statusItem);

  // // Register formatting provider
  // vscode.languages.registerDocumentFormattingEditProvider(
  //   "mint",
  //   new MintFormattingProvider()
  // );

  // Register commands
  vscode.commands.registerCommand("mint.build", cmd.mintBuildCommand);
  vscode.commands.registerCommand("mint.compile", cmd.mintCompileCommand);
  vscode.commands.registerCommand("mint.docs", cmd.mintDocsCommand);
  vscode.commands.registerCommand("mint.formatAll", cmd.mintFormatAllCommand);
  vscode.commands.registerCommand("mint.init", cmd.mintInitCommand);
  vscode.commands.registerCommand("mint.install", cmd.mintInstallCommand);
  vscode.commands.registerCommand("mint.loc", cmd.mintCountLinesCommand);
  vscode.commands.registerCommand("mint.start", cmd.mintStartCommand);
  vscode.commands.registerCommand("mint.test", cmd.mintTestCommand);
  vscode.commands.registerCommand("mint.version", cmd.mintVersionCommand);
  vscode.commands.registerCommand("mint.ls.restart", cmd.mintRestartLanguageServerCommand(ctx));

  await ctx.start();

  // Set context activated
  vscode.commands.executeCommand("setContext", "mint:isActivated", true);
}

export async function deactivate(isRestart: boolean = false): Promise<void> {
  // Set context deactivated
  vscode.commands.executeCommand("setContext", "mint:isActivated", false);

  return ctx.stop();
}
