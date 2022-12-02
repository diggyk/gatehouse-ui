import { Button, Card, Container, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useActors } from "./ActorsPage";

export default function Actor() {
  const { actors } = useActors();
  const { typestr, name } = useParams();

  if (!typestr || !name) {
    return <Container>Error -- type or name not set</Container>;
  }

  const entity = actors.get(typestr)?.get(name);

  if (!entity) {
    return (
      <Card>
        <Card.Body>ERROR: Actor not found in context</Card.Body>
      </Card>
    );
  }

  let attributes = entity.getAttributesMap();

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

  return (
    <Card className="showEntryCard">
      <Card.Body>
        <Card.Title>{entity.getName()}</Card.Title>
        <Card.Subtitle>{entity.getTypestr()}</Card.Subtitle>
        <Table className="showEntryTable">
          <thead>{headers}</thead>
          <tbody>{attrs}</tbody>
        </Table>
        <Button disabled>Edit</Button>
      </Card.Body>
    </Card>
  );
}
