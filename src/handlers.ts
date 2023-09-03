import * as vscode from "vscode";

export function onDidChangeConfiguration() {
  return vscode.workspace.onDidChangeConfiguration(async (event) => {
    const setting = ["mint.location", "mint.languageServer.location"].find(
      (option) => event.affectsConfiguration(option)
    );

    if (!setting) return;

    const restart = await vscode.window.showInformationMessage(
      `Changing "${setting}" requires restarting the language server`,
      "Restart now"
    );

    if (restart) {
      await vscode.commands.executeCommand("mint.ls.restart");
    }
  });
}
