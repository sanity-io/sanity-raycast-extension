import { List, Cache, ActionPanel, Action } from "@raycast/api";

import { useEffect, useState } from "react";
import { SanityProject } from "@sanity/client";
import { client } from "../../util/client";
import { ListDatasets } from "./datasets/ListDatasets";
import { ListMembers } from "./members/ListMembers";

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
                          title="Go to project in sanity.io/manage"
                          actions={
                            <ActionPanel>
                              <Action.OpenInBrowser
                                title="Go to Project in sanity.io/manage"
                                url={`https://www.sanity.io/manage/project/${project.id}`}
                              />
                            </ActionPanel>
                          }
                        />
                        {project.studioHost && (
                          <List.Item
                            title={`Open Sanity Studio (${project.studioHost}.sanity.studio)`}
                            actions={
                              <ActionPanel>
                                <Action.OpenInBrowser
                                  title="Open Studio"
                                  url={`https://${project.studioHost}.sanity.studio`}
                                />
                              </ActionPanel>
                            }
                          />
                        )}
                        <List.Item
                          title="View Project Members"
                          actions={
                            <ActionPanel>
                              <Action.Push title="Project Members" target={<ListMembers project={project} />} />
                            </ActionPanel>
                          }
                        />
                        <List.Item
                          title="View Project Datasets"
                          actions={
                            <ActionPanel>
                              <Action.Push title="Datasets" target={<ListDatasets project={project} />} />
                            </ActionPanel>
                          }
                        />
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
