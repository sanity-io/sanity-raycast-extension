import { Action, ActionPanel, Cache, List, Icon } from "@raycast/api";
import { SanityProject } from "@sanity/client";
import { useEffect, useState } from "react";
import { projectClient } from "../../../util/client";

const cache = new Cache();

export function ListCorsOrigins(props: { project: SanityProject }) {
  const { project } = props;
  const cahceKey = `${project.id}-corsOrigins`;
  const client = projectClient(project.id);
  const [origins, setOrigins] = useState<any[] | null>(null);

  const deleteOriginHandler = async ({ id }) => {
    const deletedOrigin = await client
      .request({ url: `/cors/${id}`, method: "DELETE" })
      .catch((err) => console.log(err));
    cache.remove(cahceKey);
  };

  useEffect(() => {
    console.log(project);
    async function fetchOrigins() {
      const cachedOrigins = cache.get(cahceKey);
      if (cachedOrigins) {
        setOrigins(JSON.parse(cachedOrigins));
      }
      const freshOrigins = await client.request({ url: `/cors` }).catch((err) => console.log(err));
      cache.set(cahceKey, JSON.stringify(freshOrigins));
      setOrigins(freshOrigins);
    }
    fetchOrigins();
  }, []);
  return (
    <List isLoading={!origins}>
      {origins &&
        origins.map((origin) => {
          return (
            <List.Item
              icon={origin.allowCredentials ? Icon.Lock : Icon.LockUnlocked}
              key={origin.id}
              title={origin.origin}
              detail={
                <List.Item.Detail
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.TagList title="Allow credentials">
                        <List.Item.Detail.Metadata.TagList.Item text="Allowed" color={"#ff0000"} />
                      </List.Item.Detail.Metadata.TagList>
                    </List.Item.Detail.Metadata>
                  }
                />
              }
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard title="Copy Origin" content={origin.origin} />
                  <Action.OpenInBrowser title="Open in Browser" url={origin.origin} />
                  <Action.Push
                    title="Delete CORS Origin"
                    target={
                      <List>
                        <List.Item
                          title="Delete CORS Origin"
                          actions={
                            <ActionPanel>
                              <Action title="Delete CORS Origin" onAction={() => deleteOriginHandler(origin.id)} />
                            </ActionPanel>
                          }
                        ></List.Item>
                      </List>
                    }
                  />
                </ActionPanel>
              }
            ></List.Item>
          );
        })}
    </List>
  );
}
