import { ActionPanel, Action, Form, useNavigation, popToRoot, showToast, Toast } from "@raycast/api";
import { useFetch, runAppleScript } from "@raycast/utils";
import { useCallback, useState } from "react";
import { Organizations } from "../../types/organization";
import { getAccessToken } from "../../util/client";
import { SanityProject } from "@sanity/client";
import fetch from "node-fetch";

interface Values {
  displayName: string;
  organizationId?: string;
}

export default function CreateProject() {
  const { pop } = useNavigation();
  const [isCreating, setIsCreateing] = useState(false);
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
    async ({ displayName, organizationId }: Values) => {
      let response;

      showToast({
        style: Toast.Style.Animated,
        title: `Creating project`,
      });

      try {
        response = (await fetch("https://api.sanity.io/v2021-06-07/projects", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            displayName,
            ...(organizationId && organizationId !== "" ? { organizationId } : {}),
          }),
        }).then((response) => response.json())) as Promise<SanityProject>;

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
    [setIsCreateing]
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
      isLoading={isLoadingOrganizations || isCreating}
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
            setNameError("The field should't be empty!");
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
    </Form>
  );
}

function validatePassword(value: string): boolean {
  return value.length >= 8;
}
