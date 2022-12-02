import { Button, Card, Container, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useGroups } from "./GroupsPage";
import { useRoles } from "./RolesPage";

export default function Role() {
  const { roles } = useRoles();
  const { typestr, name } = useParams();

  if (!name) {
    return <Container>Error -- name not set</Container>;
  }

  const role = roles.get(name);

  if (!role) {
    return (
      <Card>
        <Card.Body>ERROR: Role not found in context</Card.Body>
      </Card>
    );
  }

  let groups: JSX.Element[] = [];
  role
    .getGrantedToList()
    .sort()
    .forEach((group: string) => {
      groups.push(
        <tr key={"group_" + group}>
          <td>{group}</td>
        </tr>
      );
    });

  return (
    <Card className="showEntryCard">
      <Card.Body>
        <Card.Title>{role.getName()}</Card.Title>
        <Card.Subtitle>{role.getDesc()}</Card.Subtitle>
        <Table className="showEntryTable">
          <thead>
            <tr>
              <th>Granted To</th>
            </tr>
          </thead>
          <tbody>{groups}</tbody>
        </Table>
        <Button disabled>Edit</Button>
      </Card.Body>
    </Card>
  );
}
