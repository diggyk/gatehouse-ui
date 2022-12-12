import { Button, Card, Container, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
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
  if (attributes.getLength() > 0) {
    headers.push(
      <tr className="subheading" key="subheading">
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
      actions.push(<SectionItem key={action + "_item"}>{action}</SectionItem>);
    });
  } else {
    actions.push(<SectionItem key={"noactions"}>No actions</SectionItem>);
  }

  return (
    <Card className="showEntryCard">
      <Card.Body>
        <Card.Title>{target.getName()}</Card.Title>
        <Card.Subtitle>{target.getTypestr()}</Card.Subtitle>
        <SectionHeader>Attributes</SectionHeader>
        <SectionItem>
          <Table className="showEntryTable">
            <thead>{headers}</thead>
            <tbody>{attrs}</tbody>
          </Table>
        </SectionItem>
        <SectionHeader>Actions</SectionHeader>
        {actions}
        <Card.Footer>
          <Button disabled>Edit</Button>
        </Card.Footer>
      </Card.Body>
    </Card>
  );
}
