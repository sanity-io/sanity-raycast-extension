import { token, tokenError } from "./util/client";
import { ProjectList } from "./actions/projects/ProjectList";

export default function Command() {
  if (!token) {
    return tokenError();
  }
  return (
    <ProjectList/>
  );
}
