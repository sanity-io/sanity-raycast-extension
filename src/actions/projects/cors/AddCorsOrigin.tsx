import { ActionPanel, Action, Form, popToRoot } from "@raycast/api";
import { SanityProject } from "@sanity/client";
import { useState } from "react";
import { projectClient } from "../../../util/client";

interface CORSOriginValues {
  origin: string;
  allowCredentials: boolean;
}

export function AddCorsOrigin(props: { project: SanityProject }) {
  const [error, setError] = useState<string | undefined>();
  const { project } = props;
  const client = projectClient(project.id);
  const addCorsOriginHandler = async (values: CORSOriginValues) => {
    const { origin, allowCredentials } = values;
    try {
      await client.request({ url: `/cors`, method: "POST", body: { origin, allowCredentials } });
      popToRoot();
    } catch (error) {
      console.log(error);
      // @ts-expect-error "I can't be bothered to type this error"
      setError(error);
    }
    return;
  };
  return (
    <Form
      navigationTitle="Add CORS Origin"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add CORS Origin" onSubmit={addCorsOriginHandler} />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="origin"
        title="Origin"
        placeholder="https://"
        info="A URL in the format of protocol://hostname[:port] (use * for wildcard)"
        error={error}
      />
      <Form.Checkbox
        id="allowCredentials"
        label="Allow credentials"
        info="Should this origin be allowed to send authenticated requests with a user’s token or session? If you're hosting a Studio on the above origin you need to enable this option."
      />
    </Form>
  );
}
