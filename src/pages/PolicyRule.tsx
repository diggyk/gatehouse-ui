import { Button, Card, Container, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useRules } from "./PolicyRulesPage";

type DECIDE = proto.policies.DECIDE;
type KvCheck = proto.policies.KvCheck;
type NUM = proto.policies.NUM;
type NumberCheck = proto.policies.NumberCheck;
type SET = proto.policies.SET;
type StringCheck = proto.policies.StringCheck;

const cmpToString = (cmp: SET): string => {
  switch (cmp) {
    case 0:
      return "ONE OF";

    case 1:
      return "NOT ONE OF";
  }

  return "UNKNOWN";
};

const decideToString = (decide: DECIDE): string => {
  switch (decide) {
    case 0:
      return "DENY";
    case 1:
      return "ALLOW";
  }
  return "UNKNOWN";
};

const numOpToString = (numOp: NUM): string => {
  switch (numOp) {
    case 0:
      return "EQUALS";
    case 1:
      return "LESS THAN";
    case 2:
      return "MORE THAN";
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

  const envCheckToTable = () => {
    if (rule.getEnvAttributesList().length == 0) {
      return (
        <tr>
          <td colSpan={3}>Match any environment attributes</td>
        </tr>
      );
    } else {
      return attrCheckToTable(rule.getEnvAttributesList());
    }
  };

  const entityCheckToTable = () => {
    if (!rule.hasEntityCheck()) {
      return (
        <tr>
          <td colSpan={3}>Match any entity</td>
        </tr>
      );
    } else {
      let entityName = stringCheckToTable(
        "name",
        rule.getEntityCheck()!.getName()
      );
      let entityType = stringCheckToTable(
        "type",
        rule.getEntityCheck()!.getTypestr()
      );
      let entityAttribs = attrCheckToTable(
        rule.getEntityCheck()!.getAttributesList()
      );
      return (
        <>
          {entityName}
          {entityType}
          {entityAttribs}
          {numCheckToTable("bucket", rule.getEntityCheck()!.getBucket())}
        </>
      );
    }
  };

  const targetCheckToTable = () => {
    if (!rule.hasTargetCheck()) {
      return (
        <tr>
          <td colSpan={3}>Match any target</td>
        </tr>
      );
    } else {
      let targetName = stringCheckToTable(
        "name",
        rule.getTargetCheck()!.getName()
      );
      let targetType = stringCheckToTable(
        "type",
        rule.getTargetCheck()!.getTypestr()
      );
      let targetAttribs = attrCheckToTable(
        rule.getTargetCheck()!.getAttributesList()
      );

      let matchAttrs: JSX.Element[] = [];
      rule
        .getTargetCheck()!
        .getMatchInEntityList()
        .forEach((attr) => {
          matchAttrs.push(
            <tr key={"match_ent_" + attr}>
              <td>attr:{attr}</td>
              <td colSpan={2}>MATCHS IN ENTITY</td>
            </tr>
          );
        });

      rule
        .getTargetCheck()!
        .getMatchInEnvList()
        .forEach((attr) => {
          matchAttrs.push(
            <tr key={"match_env_" + attr}>
              <td>attr:{attr}</td>
              <td colSpan={2}>MATCHS IN ENV</td>
            </tr>
          );
        });

      let targetAction;
      if (!rule.getTargetCheck()!.getAction()) {
        targetAction = (
          <tr>
            <td>Action</td>
            <td colSpan={2}>ANY</td>
          </tr>
        );
      } else {
        targetAction = stringCheckToTable(
          "action",
          rule.getTargetCheck()!.getAction()!
        );
      }

      return (
        <>
          {targetName}
          {targetType}
          {targetAttribs}
          {matchAttrs}
          {targetAction}
        </>
      );
    }
  };

  const stringCheckToTable = (
    name: string,
    check: StringCheck | null
  ): JSX.Element => {
    if (!check) {
      return (
        <tr>
          <td>{name}</td>
          <td colSpan={2}>ANY</td>
        </tr>
      );
    } else {
      const check_type = cmpToString(check?.getValCmp()!);
      return (
        <tr>
          <td>{name}</td>
          <td>{check_type}</td>
          <td>{check?.getValsList().sort().join(", ")}</td>
        </tr>
      );
    }
  };

  const attrCheckToTable = (attrChecks: Array<KvCheck>): JSX.Element[] => {
    let rows: JSX.Element[] = [];
    attrChecks.forEach((attrCheck) => {
      let check_type = cmpToString(attrCheck.getOp());
      let attrKey = attrCheck.getKey();
      rows.push(
        <tr key={attrKey + "@" + check_type}>
          <td>attr:{attrCheck.getKey()}</td>
          <td>{cmpToString(attrCheck.getOp())}</td>
          <td>{attrCheck.getValsList().sort().join(", ")}</td>
        </tr>
      );
    });

    return rows;
  };

  const numCheckToTable = (
    name: string,
    check: NumberCheck | null
  ): JSX.Element => {
    if (!check) {
      return (
        <tr key={name + "_check"}>
          <td>{name}</td>
          <td colSpan={2}>ANY</td>
        </tr>
      );
    } else {
      return (
        <tr key={name + "_check"}>
          <td>{name}</td>
          <td>{numOpToString(check.getOp())}</td>
          <td>{check.getVal()}</td>
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
              <th colSpan={3}>When entity matches...</th>
            </tr>
          </thead>
          <tbody>{entityCheckToTable()}</tbody>
          <thead>
            <tr>
              <th colSpan={3}>When environment matches...</th>
            </tr>
          </thead>
          <tbody>{envCheckToTable()}</tbody>
          <thead>
            <tr>
              <th colSpan={3}>When target matches...</th>
            </tr>
          </thead>
          <tbody>{targetCheckToTable()}</tbody>
          <thead>
            <tr>
              <th colSpan={3}>...then decide</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{decideToString(rule.getDecision())}</td>
            </tr>
          </tbody>
        </Table>
        <Button disabled>Edit</Button>
      </Card.Body>
    </Card>
  );
}
