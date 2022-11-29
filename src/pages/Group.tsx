import { Button, Card, Container, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useGroups } from "./GroupsPage";

export default function Group() {
  const { groups } = useGroups();
  const { typestr, name } = useParams();

  if (!name) {
    return <Container>Error -- name not set</Container>;
  }

  const group = groups.get(name);

  if (!group) {
    return (
      <Card>
        <Card.Body>ERROR: Group not found in context</Card.Body>
      </Card>
    );
  }

  let roles: JSX.Element[] = [];
  group
    .getRolesList()
    .sort()
    .forEach((role) => {
      roles.push(
        <tr key={"role_" + role}>
          <td>{role}</td>
        </tr>
      );
    });

  let members: JSX.Element[] = [];
  group
    .getMembersList()
    .sort((a, b) => {
      let type_cmp = a.getTypestr().localeCompare(b.getTypestr());
      if (type_cmp == 0) {
        return a.getName().localeCompare(b.getName());
      } else {
        return type_cmp;
      }
    })
    .forEach((member) => {
      members.push(
        <tr key={member.getTypestr() + ":" + member.getName()}>
          <td>
            {member.getTypestr()}:{member.getName()}
          </td>
        </tr>
      );
    });

  return (
    <Card className="showEntryCard">
      <Card.Body>
        <Card.Title>{group.getName()}</Card.Title>
        <Card.Subtitle>{group.getDesc()}</Card.Subtitle>
        <Table className="showEntryTable">
          <thead>
            <tr>
              <th>Roles</th>
            </tr>
          </thead>
          <tbody>{roles}</tbody>
          <thead>
            <tr>
              <th>Members</th>
            </tr>
          </thead>
          <tbody>{members}</tbody>
        </Table>
        <Button disabled>Edit</Button>
      </Card.Body>
    </Card>
  );
}
