import { List } from "@raycast/api";
import { ShowProjectsListItem } from "./actions/projects";

export default function Command() {
  return (
    <List>
      <ShowProjectsListItem />
    </List>
  );
}
