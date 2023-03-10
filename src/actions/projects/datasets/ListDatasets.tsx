import { List, ActionPanel } from "@raycast/api";
import { useEffect, useState } from "react";
import { projectClient } from "../../../util/client";

interface Dataset {
  name: string;
  aclMode: "private" | "public" | "custom";
}

export function ListDatasets(props: { project: { id: string } }) {
  const { project } = props;
  const client = projectClient(project.id);
  const [datasets, setDatasets] = useState<Dataset[] | null>(null);
  useEffect(() => {
    async function fetchDatasets() {
      const datasets: Dataset[] = await client.datasets.list();
      console.log(datasets);
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
              actions={<ActionPanel></ActionPanel>}
            ></List.Item>
          );
        })}
    </List>
  );
}
