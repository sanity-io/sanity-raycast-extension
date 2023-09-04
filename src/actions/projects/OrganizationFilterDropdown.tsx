import { List } from "@raycast/api";
import { Organization } from "../../types/organization";

export function OrganizationFilterDropdown(props: {
  organizations: Organization[];
  onOrganizationFilterChange: (newValue: string) => void;
}) {
  const { organizations, onOrganizationFilterChange } = props;
  return (
    <List.Dropdown
      tooltip="Select Organization"
      storeValue={true}
      onChange={(newValue) => {
        onOrganizationFilterChange(newValue);
      }}
    >
      <List.Dropdown.Item key={`organization-all`} title="All" value="all" />
      <List.Dropdown.Item key={`organization-personal`} title="Personal" value="personal" />
      <List.Dropdown.Section title="Organization">
        {organizations.map((organization) => (
          <List.Dropdown.Item
            key={`organization-${organization.id}`}
            title={organization.name}
            value={organization.id}
          />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}
