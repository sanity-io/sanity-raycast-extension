import { List, ActionPanel, Action, Icon, Color } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useMemo, useState } from "react";
import { SanityProject } from "@sanity/client";
import { getAccessToken } from "../../util/client";
import { ListDatasets } from "./datasets/ListDatasets";
import { ListMembers } from "./members/ListMembers";
import { ListCorsOrigins } from "./cors/ListCorsOrigins";
import { AddCorsOrigin } from "./cors/AddCorsOrigin";
import { Organizations } from "../../types/organization";
import CreateProject from "./CreateProject";
import { OrganizationFilterDropdown } from "./OrganizationFilterDropdown";

const COLORS = [Color.Green, Color.Orange, Color.Yellow, Color.Purple, Color.Blue, Color.Red, Color.Magenta];

function getTagColor(index: number) {
  return COLORS[index % COLORS.length];
}

export function ProjectList() {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("all");
  const onOrganizationFilterChange = (newOrganizationFilter: string) => {
    setSelectedOrganizationId(newOrganizationFilter);
  };

  const { isLoading: isLoadingProjects, data: projects = [] } = useFetch<SanityProject[]>(
    "https://api.sanity.io/v2021-06-07/projects?includeOrganizationProjects=true",
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );
  const { isLoading: isLoadingOrganizations, data: organizations = [] } = useFetch<Organizations>(
    "https://api.sanity.io/v2021-06-07/organizations",
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );

  const personalProjects = useMemo(() => projects.filter((project) => project.organizationId === null), [projects]);
  const hasPersonalProjects = personalProjects.length > 0;
  const personalTagColor = useMemo(() => getTagColor(0), []);
  const orgIdColorMap = useMemo(() => {
    const map = new Map<string, Color>();
    organizations.forEach((org, index) => {
      const color = getTagColor(hasPersonalProjects ? index + 1 : index);
      map.set(org.id, color);
    });
    return map;
  }, [hasPersonalProjects, organizations]);

  const selectedOrganizations = useMemo(
    () =>
      selectedOrganizationId === "all"
        ? organizations
        : organizations.filter((organization) => organization.id === selectedOrganizationId),
    [organizations, selectedOrganizationId]
  );

  return (
    <List
      filtering={true}
      isLoading={isLoadingProjects || isLoadingOrganizations}
      searchBarAccessory={
        <OrganizationFilterDropdown
          organizations={organizations}
          onOrganizationFilterChange={onOrganizationFilterChange}
        />
      }
    >
      <List.Item
        title="Create project"
        icon={Icon.Plus}
        actions={
          <ActionPanel>
            <Action.Push title="Open form" target={<CreateProject />} />
          </ActionPanel>
        }
      />
      {personalProjects.length > 0 && ["all", "personal"].includes(selectedOrganizationId) && (
        <List.Section key={"personal"} title="Personal">
          {projects
            .filter((project) => project.organizationId === null)
            .map((project) => (
              <ProjectItem key={project.id} project={project} tagColor={personalTagColor} />
            ))}
        </List.Section>
      )}
      {selectedOrganizations.map((organization) => (
        <List.Section key={organization.id} title={organization.name}>
          {projects
            .filter((project) => project.organizationId === organization.id)
            .map((project) => (
              <ProjectItem key={project.id} project={project} tagColor={orgIdColorMap.get(organization.id)!} />
            ))}
        </List.Section>
      ))}
    </List>
  );
}

function ProjectItem({ project, tagColor }: { project: SanityProject; tagColor: Color }) {
  return (
    <List.Item
      key={project.id}
      keywords={[project.id]}
      title={project.displayName}
      accessories={[{ tag: { value: project.id, color: tagColor } }]}
      actions={
        <ActionPanel>
          <ActionPanel.Section key="manage" title="Manage">
            <Action.OpenInBrowser
              title="Go to Project in sanity.io/manage"
              url={`https://www.sanity.io/manage/project/${project.id}`}
            />
            <Action.CopyToClipboard title="Copy project ID" content={project.id} icon={Icon.Clipboard} />
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
          </ActionPanel.Section>
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
              </List>
            }
          />
        </ActionPanel>
      }
    />
  );
}
