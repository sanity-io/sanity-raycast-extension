import { ActionPanel, List, Action } from "@raycast/api";
import { ProjectList } from "./ProjectList";

export const ShowProjectsListItem = () => {
  return (
    <>
      <List.Item
        icon="list-icon.png"
        title="Your Projects"
        actions={
          <ActionPanel>
            <Action.Push title="Browse Projects" target={<ProjectList />} />
          </ActionPanel>
        }
      />
      <List.Item
        icon="list-icon.png"
        title="Create a New Sanity Studio"
        actions={
          <ActionPanel>
            <Action title="Create a New Studio" onAction={() => null} />
          </ActionPanel>
        }
      />
    </>
  );
};
