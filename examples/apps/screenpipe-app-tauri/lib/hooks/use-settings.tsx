import { useState, useEffect } from "react";
import { Store } from "@tauri-apps/plugin-store";
import { localDataDir } from "@tauri-apps/api/path";
import { join } from "@tauri-apps/api/path";

interface Settings {
  openaiApiKey: string;
  useOllama: boolean;
  ollamaUrl: string;
  isLoading: boolean;
  useCloudAudio: boolean;
  useCloudOcr: boolean;
  aiModel: string;
  installedPipes: string[];
  userId: string;
  customPrompt: string;
  devMode: boolean;
}

let store: Store | null = null;

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    openaiApiKey: "",
    useOllama: false,
    ollamaUrl: "http://localhost:11434",
    isLoading: true,
    useCloudAudio: false,
    useCloudOcr: false,
    aiModel: "gpt-4o",
    installedPipes: [],
    userId: "",
    customPrompt: "",
    devMode: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!store) {
        await initStore();
      }

      try {
        await store!.load();
        const savedKey = ((await store!.get("openaiApiKey")) as string) || "";
        const savedUseOllama =
          ((await store!.get("useOllama")) as boolean) || false;
        const savedUseCloudAudio =
          ((await store!.get("useCloudAudio")) as boolean) ?? false;
        const savedUseCloudOcr =
          ((await store!.get("useCloudOcr")) as boolean) ?? false;
        const savedOllamaUrl =
          ((await store!.get("ollamaUrl")) as string) ||
          "http://localhost:11434";
        const savedAiModel =
          ((await store!.get("aiModel")) as string) || "gpt-4o";
        const savedInstalledPipes =
          ((await store!.get("installedPipes")) as string[]) || [];
        const savedUserId = ((await store!.get("userId")) as string) || "";
        const savedCustomPrompt =
          ((await store!.get("customPrompt")) as string) || "";
        const savedDevMode =
          ((await store!.get("devMode")) as boolean) || false;
        setSettings({
          openaiApiKey: savedKey,
          useOllama: savedUseOllama,
          isLoading: false,
          useCloudAudio: savedUseCloudAudio,
          useCloudOcr: savedUseCloudOcr,
          ollamaUrl: savedOllamaUrl,
          aiModel: savedAiModel,
          installedPipes: savedInstalledPipes,
          userId: savedUserId,
          customPrompt: savedCustomPrompt,
          devMode: savedDevMode,
        });
      } catch (error) {
        console.error("Failed to load settings:", error);
        setSettings((prevSettings) => ({ ...prevSettings, isLoading: false }));
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!store) {
      await initStore();
    }

    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await store!.set("openaiApiKey", updatedSettings.openaiApiKey);
      await store!.set("useOllama", updatedSettings.useOllama);
      await store!.set("useCloudAudio", updatedSettings.useCloudAudio);
      await store!.set("useCloudOcr", updatedSettings.useCloudOcr);
      await store!.set("ollamaUrl", updatedSettings.ollamaUrl);
      await store!.set("aiModel", updatedSettings.aiModel);
      await store!.set("installedPipes", updatedSettings.installedPipes);
      await store!.set("userId", updatedSettings.userId);
      await store!.set("customPrompt", updatedSettings.customPrompt);
      await store!.set("devMode", updatedSettings.devMode);
      await store!.save();
    } catch (error) {
      console.error("Failed to update settings:", error);
      // Revert local state if store update fails
      setSettings(settings);
    }
  };

  return { settings, updateSettings };
}

async function initStore() {
  const dataDir = await localDataDir();
  const storePath = await join(dataDir, "screenpipe", "store.bin");
  store = new Store(storePath);
}
