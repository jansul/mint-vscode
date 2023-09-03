import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

export enum MintContextStatus {
  Starting,
  Running,
  Stopped,
  FailedToStart,
}

export class MintContext {
  private languageClient?: LanguageClient;

  constructor(
    private extensionContext: vscode.ExtensionContext,
    private statusItem: vscode.LanguageStatusItem
  ) {}

  async start(): Promise<void> {
    this.updateStatusBar(MintContextStatus.Starting);

    this.languageClient?.dispose();
    this.languageClient = undefined;

    const binaryPath = vscode.workspace
      .getConfiguration("mint.languageServer")
      .get<string>("location");

    const storagePath = this.extensionContext.globalStorageUri.path;

    const serverOptions: ServerOptions = {
      command: binaryPath,
      args: ["ls"],
    };

    const clientOptions: LanguageClientOptions = {
      documentSelector: [{ scheme: "file", language: "mint" }],
      initializationOptions: {
        binaryPath,
        storagePath,
      },
    };

    this.languageClient = new LanguageClient(
      "mint",
      "Mint Language Server",
      serverOptions,
      clientOptions
    );

    try {
      await this.languageClient.start();
      this.updateStatusBar(MintContextStatus.Running);
    } catch (error) {
      this.languageClient = undefined;
      this.updateStatusBar(MintContextStatus.FailedToStart);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.languageClient) {
      await this.languageClient.dispose();
      this.languageClient = undefined;

      this.updateStatusBar(MintContextStatus.Stopped);
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.start();
  }

  updateStatusBar(status: MintContextStatus) : void {
    this.statusItem.detail = "Mint Language Server"
    this.statusItem.text = this.getStatusText(status)
    this.statusItem.busy = this.getStatusBusy(status);
    this.statusItem.severity = this.getStatusSeverity(status);

    this.statusItem.command = {
      title: "Restart",
      command: "mint.ls.restart",
    };
  }

  private getStatusText(status: MintContextStatus) : string {
    switch (status) {
      case MintContextStatus.Starting:
        return "$(loading~spin) Starting";
      case MintContextStatus.Running:
        return "$(check) Running";
      case MintContextStatus.Stopped:
        return "Stopped";
      case MintContextStatus.FailedToStart:
        return "Failed to start";
      default:
        return "Unknown status";
    }
  }

  private getStatusBusy(status: MintContextStatus) : boolean {
    switch (status) {
      case MintContextStatus.Starting:
        return true;
      default:
        return false;
    }
  }

  private getStatusSeverity(status: MintContextStatus) : vscode.LanguageStatusSeverity {
    switch (status) {
      case MintContextStatus.FailedToStart:
        return vscode.LanguageStatusSeverity.Error;
      default:
        return vscode.LanguageStatusSeverity.Information;
    }
  }
}
