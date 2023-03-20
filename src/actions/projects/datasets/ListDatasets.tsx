import { List, ActionPanel, Action, Cache } from "@raycast/api";
import { useEffect, useState } from "react";
import { projectClient } from "../../../util/client";
const cache = new Cache();
interface Dataset {
  name: string;
  aclMode: "private" | "public" | "custom";
}

export function ListDatasets(props: { project: { id: string } }) {
  const { project } = props;
  const cacheKey = `${project.id}-datasets`;
  const client = projectClient(project.id);
  const [datasets, setDatasets] = useState<Dataset[] | null>(null);
  useEffect(() => {
    async function fetchDatasets() {
      const cachedDatasets = cache.get(cacheKey);
      if (cachedDatasets) {
        setDatasets(JSON.parse(cachedDatasets));
      }
      const datasets: Dataset[] = await client.datasets.list();
      cache.set(cacheKey, JSON.stringify(datasets));
      setDatasets(datasets);
    }
    fetchDatasets();
  }, []);

  return (
    <List isLoading={!datasets}>
      {datasets &&
        datasets.map((dataset) => {
          return (
            <List.Item
              key={dataset.name}
              title={`${dataset.name} (${dataset.aclMode})`}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard title="Copy Dataset Name" content={dataset.name} />
                </ActionPanel>
              }
            ></List.Item>
          );
        })}
    </List>
  );
}
