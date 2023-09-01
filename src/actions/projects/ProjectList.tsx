import { List, Cache, ActionPanel, Action, Icon, LaunchProps } from "@raycast/api";
import { useFetch } from "@raycast/utils";

import { useEffect, useMemo, useState } from "react";
import { SanityProject } from "@sanity/client";
import { client, getAccessToken } from "../../util/client";
import { ListDatasets } from "./datasets/ListDatasets";
import { ListMembers } from "./members/ListMembers";
import { ListCorsOrigins } from "./cors/ListCorsOrigins";
import { AddCorsOrigin } from "./cors/AddCorsOrigin";
import { Organizations } from "../../types/organization";
import CreateProject from "./CreateProject";

const cache = new Cache();

export function ProjectList() {
  const {
    isLoading: isLoadingProjects,
    data: projects = [],
  } = useFetch<SanityProject[]>("https://api.sanity.io/v2021-06-07/projects?includeOrganizationProjects=true", {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  const { isLoading: isLoadingOrganizations, data: organizations = [] } = useFetch<Organizations>(
    "https://api.sanity.io/v2021-06-07/organizations",
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );

  const personalProjects = useMemo(() => projects.filter((project) => project.organizationId === null), [projects]);

  return (
    <List filtering={true} isLoading={isLoadingProjects || isLoadingOrganizations}>
      <List.Item
        title="Create project"
        icon={Icon.Plus}
        actions={
          <ActionPanel>
            <Action.Push title="Open form" target={<CreateProject />} />
          </ActionPanel>
        }
      />
      {personalProjects.length > 0 && (
        <List.Section key={"personal"} title="Personal">
          {projects
            .filter((project) => project.organizationId === null)
            .map((project) => (
              <ProjectItem key={project.id} project={project} />
            ))}
        </List.Section>
      )}
      {organizations.map((organization) => (
        <List.Section key={organization.id} title={organization.name}>
          {projects
            .filter((project) => project.organizationId === organization.id)
            .map((project) => (
              <ProjectItem key={project.id} project={project} />
            ))}
        </List.Section>
      ))}
    </List>
  );
}

function ProjectItem({ project }: { project: SanityProject }) {
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
}
