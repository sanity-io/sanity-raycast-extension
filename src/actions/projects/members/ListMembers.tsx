import { useEffect, useState } from "react";
import { ActionPanel, Action, List, Cache, Image, Icon } from "@raycast/api";
import { SanityProject, SanityUser } from "@sanity/client";
import { projectClient } from "../../../util/client";

interface SanityExtendedUser extends SanityUser {
  email: string;
  provider: "google" | "github" | "sanity" | "sso";
  isCurrentUser: boolean;
}

const iconResolver = (provider: string) => {
  switch (provider) {
    case "google":
      return "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";
    case "github":
      return "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/github.svg";
    default:
      return "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/mail.svg";
  }
};

const cache = new Cache();
export function ListMembers(props: { project: SanityProject }) {
  const { project } = props;
  const membersList = project.members.map(({ id }: { id: string }) => id).join(",");
  const cacheKey = `${project.id}-membersList`;
  const [members, setMembers] = useState<SanityExtendedUser[] | null>(null);
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
    <List filtering={true} isLoading={!members} isShowingDetail>
      {members &&
        members.map((member) => {
          return (
            <List.Item
              icon={{ source: member.imageUrl || "", mask: Image.Mask.Circle }}
              key={member.id}
              title={member.displayName}
              actions={
                <ActionPanel>
                  {member.email && <Action.CopyToClipboard title="Copy Email" content={member.email} />}
                </ActionPanel>
              }
              detail={
                <List.Item.Detail
                  markdown={member.imageUrl && `![${member.displayName}](${member.imageUrl})`}
                  metadata={
                    <List.Item.Detail.Metadata>
                      {member.isCurrentUser && (
                        <List.Item.Detail.Metadata.Label title="Is it you?" icon={Icon.CheckCircle} />
                      )}
                      <List.Item.Detail.Metadata.Label title="Name" text={member.givenName + " " + member.familyName} />
                      {member.email && (
                        <List.Item.Detail.Metadata.Label
                          title="Email"
                          text={member.email}
                          icon={iconResolver(member.provider)}
                        />
                      )}
                    </List.Item.Detail.Metadata>
                  }
                />
              }
            ></List.Item>
          );
        })}
    </List>
  );
}
