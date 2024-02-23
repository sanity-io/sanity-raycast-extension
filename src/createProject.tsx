import { token, tokenError } from "./util/client";
import CreateProject from "./actions/projects/CreateProject";

export default function CreateProjectCommand() {
  if (!token) {
    return tokenError();
  }
  return (
    <CreateProject/>
  );
}
