import { List, Cache, ActionPanel, Action, Icon } from "@raycast/api";

import { useEffect, useState } from "react";
import { SanityProject } from "@sanity/client";
import { client } from "../../util/client";
import { ListDatasets } from "./datasets/ListDatasets";
import { ListMembers } from "./members/ListMembers";
import { ListCorsOrigins } from "./cors/ListCorsOrigins";
import { AddCorsOrigin } from "./cors/AddCorsOrigin";

const cache = new Cache();

export function ProjectList() {
  const [projects, setProjects] = useState<SanityProject[] | null>(null);
  useEffect(() => {
    async function fetchProjects() {
      const cachedProjects = cache.get("projects");
      /*
       * If we have a cached version of the projects, use that
       * while we fetch the fresh version in the background
       * */
      if (cachedProjects) {
        setProjects(JSON.parse(cachedProjects));
      }
      const freshProjects: SanityProject[] = await client.projects.list();
      cache.set("projects", JSON.stringify(freshProjects));
      setProjects(freshProjects);
    }
    fetchProjects();
  }, []);
  return (
    <List filtering={true} isLoading={projects ? false : true}>
      {projects &&
        projects.map((project) => {
          return (
            <List.Item
              key={project.id}
              title={project.displayName}
              actions={
                <ActionPanel>
                  <Action.Push
                    title="Open Project"
                    target={
                      <List>
                        <List.Item
                          title="Go to Project in sanity.io/manage"
                          icon={Icon.Globe}
                          actions={
                            <ActionPanel>
                              <Action.OpenInBrowser
                                title="Go to Project in sanity.io/manage"
                                url={`https://www.sanity.io/manage/project/${project.id}`}
                              />
                            </ActionPanel>
                          }
                        />
                        {project.metadata.externalStudioHost && (
                          <List.Item
                            title={`Open Sanity Studio (${project.metadata.externalStudioHost})`}
                            icon={Icon.AppWindowSidebarLeft}
                            actions={
                              <ActionPanel>
                                <Action.OpenInBrowser title="Open Studio" url={project.metadata.externalStudioHost} />
                              </ActionPanel>
                            }
                          />
                        )}
                        <List.Item
                          title="View Project Members"
                          icon={Icon.Person}
                          actions={
                            <ActionPanel>
                              <Action.Push title="Project Members" target={<ListMembers project={project} />} />
                            </ActionPanel>
                          }
                        />
                        <List.Item
                          title="View Project Datasets"
                          icon={Icon.Coins}
                          actions={
                            <ActionPanel>
                              <Action.Push title="Datasets" target={<ListDatasets project={project} />} />
                            </ActionPanel>
                          }
                        />
                        <List.Item
                          title="View CORS Origins"
                          icon={Icon.Switch}
                          actions={
                            <ActionPanel>
                              <Action.Push title="CORS Origins" target={<ListCorsOrigins project={project} />} />
                              <Action.Push title="Add CORS Origin" target={<AddCorsOrigin project={project} />} />
                            </ActionPanel>
                          }
                        />
                        {/* <List.Item title="Delete Project" icon={Icon.Warning}>
                          <ActionPanel>
                            <Action title="Delete Project" onAction={() => console.log("Delete Project")} />
                          </ActionPanel>
                        </List.Item> */}
                      </List>
                    }
                  />
                </ActionPanel>
              }
            />
          );
        })}
    </List>
  );
}
