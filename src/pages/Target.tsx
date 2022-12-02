import { Button, Card, Container, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useTargets } from "./TargetsPage";

export default function Actor() {
  const { targets } = useTargets();
  const { typestr, name } = useParams();

  if (!typestr || !name) {
    return <Container>Error -- type or name not set</Container>;
  }

  const target = targets.get(typestr)?.get(name);

  if (!target) {
    return (
      <Card>
        <Card.Body>ERROR: Target not found in context</Card.Body>
      </Card>
    );
  }

  let attributes = target.getAttributesMap();

  let headers: JSX.Element[] = [];
  headers.push(
    <tr>
      <th colSpan={2}>Attributes</th>
    </tr>
  );
  if (attributes.getLength() > 0) {
    headers.push(
      <tr className="subheading">
        <th>Key</th>
        <th>Value(s)</th>
      </tr>
    );
  }

  let attrs: JSX.Element[] = [];
  if (attributes.getLength() > 0) {
    attributes.forEach((val: proto.common.AttributeValues, key: string) => {
      attrs.push(
        <tr key={key}>
          <td>{key}</td>
          <td>{val.getValuesList().join(", ")}</td>
        </tr>
      );
    });
  } else {
    attrs.push(
      <tr key="emptyattributes">
        <td colSpan={2}>No attributes</td>
      </tr>
    );
  }

  let actions: JSX.Element[] = [];
  let actions_list = target.getActionsList().sort();
  if (actions_list.length > 0) {
    actions_list.forEach((action) => {
      actions.push(
        <tr>
          <td>{action}</td>
        </tr>
      );
    });
  } else {
    actions.push(
      <tr>
        <td>No actions</td>
      </tr>
    );
  }

  return (
    <Card className="showEntryCard">
      <Card.Body>
        <Card.Title>{target.getName()}</Card.Title>
        <Card.Subtitle>{target.getTypestr()}</Card.Subtitle>
        <Table className="showEntryTable">
          <thead>{headers}</thead>
          <tbody>{attrs}</tbody>
          <thead>
            <tr>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{actions}</tbody>
        </Table>
        <Button disabled>Edit</Button>
      </Card.Body>
    </Card>
  );
}
