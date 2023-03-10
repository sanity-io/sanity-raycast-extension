import { useEffect, useState } from "react";
import { ActionPanel, Action, List, Cache, Image } from "@raycast/api";
import { SanityProject, SanityUser } from "@sanity/client";
import { projectClient } from "../../../util/client";

const cache = new Cache();
export function ListMembers(props: { project: SanityProject }) {
  const { project } = props;
  const membersList = project.members.map(({ id }: { id: string }) => id).join(",");
  const cacheKey = `${project.id}-membersList`;
  const [members, setMembers] = useState<SanityUser[] | null>(null);
  useEffect(() => {
    async function fetchMembers() {
      const cachedMembers = cache.get(cacheKey);
      if (cachedMembers) {
        setMembers(JSON.parse(cachedMembers));
      }
      const freshMembers = await projectClient(project.id)
        .request({ url: `/users/${membersList}` })
        .catch((err) => console.log(err));

      cache.set(cacheKey, JSON.stringify(freshMembers));
      setMembers(freshMembers);
    }
    fetchMembers();
  }, []);
  return (
    <List filtering={true} isLoading={!members}>
      {members &&
        members.map((member) => {
          return (
            <List.Item
              icon={{ source: member.imageUrl || "", mask: Image.Mask.Circle }}
              key={member.id}
              title={member.displayName}
              actions={
                <ActionPanel>
                  <Action title="Select User" onAction={() => null} />
                </ActionPanel>
              }
            ></List.Item>
          );
        })}
    </List>
  );
}
