import { Button, Card, Container, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useRules } from "./PolicyRulesPage";

type CMP = proto.policies.CMP;
type EntityCheck = proto.policies.EntityCheck;

const cmpToString = (cmp: CMP): string => {
  switch (cmp) {
    case 0: {
      return "IS";
    }
    case 1: {
      return "IS NOT";
    }
  }

  return "UNKNOWN";
};

export default function PolicyRule() {
  const { rules } = useRules();
  const { name } = useParams();

  if (!name) {
    return <Container>Error -- name not set</Container>;
  }

  const rule = rules.get(name);

  if (!rule) {
    return (
      <Card>
        <Card.Body>ERROR: Rule not found in context</Card.Body>
      </Card>
    );
  }

  const entityCheck = () => {
    if (!rule.hasEntityCheck()) {
      return (
        <tr>
          <td colSpan={3}>Match any entity</td>
        </tr>
      );
    } else {
      let entityName = entityNameCheck(rule.getEntityCheck()!);
      return <>{entityName}</>;
    }
  };

  const entityNameCheck = (entityCheck: EntityCheck) => {
    if (!entityCheck.getName()) {
      return (
        <tr>
          <td>Name</td>
          <td colSpan={2}>ANY</td>
        </tr>
      );
    } else {
      const check = cmpToString(entityCheck.getName()?.getValCmp()!);
      return (
        <tr>
          <td>Name</td>
          <td>{check}</td>
          <td>{entityCheck.getName()?.getVal()}</td>
        </tr>
      );
    }
  };

  return (
    <Card className="showEntryCard">
      <Card.Body>
        <Card.Title>{rule.getName()}</Card.Title>
        <Card.Subtitle>{rule.getDesc() || "No description"}</Card.Subtitle>
        <Table className="showEntryTable">
          <thead>
            <tr>
              <th colSpan={2}>Entity match</th>
            </tr>
          </thead>
          <tbody>{entityCheck()}</tbody>
        </Table>
        <Button disabled>Edit</Button>
      </Card.Body>
    </Card>
  );
}
