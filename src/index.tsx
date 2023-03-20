import { List } from "@raycast/api";
import { SanityExtension } from "./SanityExtension";
import { token, tokenError } from "./util/client";

export default function Command() {
  if (!token) {
    return tokenError();
  }
  return (
    <List>
      <SanityExtension />
    </List>
  );
}
