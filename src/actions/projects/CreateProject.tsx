import { ActionPanel, Action, Form, popToRoot, showToast, Toast } from "@raycast/api";
import { useFetch, runAppleScript } from "@raycast/utils";
import { useCallback, useState } from "react";
import { Organizations } from "../../types/organization";
import { getAccessToken } from "../../util/client";
import { SanityProject } from "@sanity/client";
import fetch from "node-fetch";

interface Values {
  displayName: string;
  privateDataset: boolean;
  organizationId?: string;
}

export default function CreateProject() {
  const [nameError, setNameError] = useState<string | undefined>();
  const { isLoading: isLoadingOrganizations, data: organizations = [] } = useFetch<Organizations>(
    "https://api.sanity.io/v2021-06-07/organizations",
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }
  );

  const createProjectCall: (values: Values) => Promise<SanityProject | undefined> = useCallback(
    async ({ displayName, organizationId, privateDataset = true }: Values) => {
      let response;

      showToast({
        style: Toast.Style.Animated,
        title: `Creating project`,
      });

      try {
        response = await fetch("https://api.sanity.io/v2021-06-07/projects", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            displayName,
            ...(organizationId && organizationId !== "" ? { organizationId } : {}),
          }),
        }).then((response) => response.json()) as SanityProject;

        
        await fetch(`https://api.sanity.io/v2021-06-07/projects/${response.id}/datasets/production`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aclMode: privateDataset ? 'private' : 'public',
          }),
        }).then((response) => response.json())

        showToast({
          style: Toast.Style.Success,
          title: `Created project ${displayName}`,
        });
      } catch (error: any) {
        showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: error.message,
        });
      } finally {
        return response;
      }
    },
    []
  );

  const handleCreate = useCallback(
    async (values: Values) => {
      await createProjectCall(values);

      popToRoot();
    },
    [createProjectCall]
  );

  const handleCreateAndOpen = useCallback(
    async (values: Values) => {
      const project = await createProjectCall(values);
      const orgSegment =
        values.organizationId && values.organizationId !== ""
          ? `organizations/${values.organizationId}`
          : `manage/personal`;
      const url = `https://www.sanity.io/${orgSegment}/project/${project.id}`;

      await runAppleScript(`do shell script "open ${url}"`);

      popToRoot();
    },
    [createProjectCall]
  );

  function dropNameErrorIfNeeded() {
    if (nameError && nameError.length > 0) {
      setNameError(undefined);
    }
  }

  return (
    <Form
      isLoading={isLoadingOrganizations}
      navigationTitle="Create a Sanity project"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create project" onSubmit={handleCreate} />
          <Action.SubmitForm title="Create project & open in Manage" onSubmit={handleCreateAndOpen} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="displayName"
        title="Project name"
        placeholder="Enter the display name of your project"
        error={nameError}
        onChange={dropNameErrorIfNeeded}
        onBlur={(event) => {
          if (event.target.value?.length == 0) {
            setNameError("Please fill out Project name");
          } else {
            dropNameErrorIfNeeded();
          }
        }}
      />
      <Form.Dropdown id="organization" title="Organization" defaultValue="">
        <Form.Dropdown.Item value="" title="Personal" />
        {organizations.map((organization) => (
          <Form.Dropdown.Item key={organization.id} value={organization.id} title={organization.name} />
        ))}
      </Form.Dropdown>
      <Form.Checkbox id="privateDataset" label="Private dataset" defaultValue={true} info="By default datasets is public. If enabled, this will make the dataset private." />
    </Form>
  );
}