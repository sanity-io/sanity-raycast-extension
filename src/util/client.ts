import ConfigStore from "configstore";
import { createClient } from "@sanity/client";

const config = new ConfigStore("sanity", {}, { globalConfigPath: true });
const token = config.get("authToken");
if (!token) {
  throw new Error("Authenticate by running `npx sanity login` in your commandline first");
}

export const client = createClient({
  apiVersion: "2023-03-08",
  requestTagPrefix: "raycast.sanity",
  token,
  useProjectHostname: false,
  useCdn: false,
});

export const projectClient = (projectId: string) =>
  client.withConfig({
    projectId,
    useProjectHostname: true,
  });
