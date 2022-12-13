import { useState } from "react";
import { Button, Card, Container, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import AttributeEditor from "../elements/AttributeEditor";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import SetListEditor from "../elements/SetListEditor";
import { usePageContext } from "./TargetsPage";

export default function EditActor() {
  const { typestr, name } = useParams();
  const { client, targets, setTargets, setErrorMsg, setStatusMsg } =
    usePageContext();
  const {
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "all" });

  const [attribs, setAttribs]: [Map<string, Set<string>>, any] = useState(
    new Map()
  );
  const [actions, setActions]: [Set<string>, Function] = useState(new Set());

  const attribsToMessage = (
    attrs: Map<string, proto.common.AttributeValues>
  ): string => {
    let msg: string = "";
    attrs.forEach((vals, key) => {
      msg += key + ": " + vals.getValuesList().join(", ") + "\n";
    });

    return msg;
  };

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

  return (
    <Card className="showEntryCard">
      <Card.Body>
        <Card.Title>{target.getName()}</Card.Title>
        <Card.Subtitle>{target.getTypestr()}</Card.Subtitle>
        <SectionHeader>Attributes</SectionHeader>
        <SectionItem>
          <AttributeEditor
            attribs={attribs}
            setAttribs={setAttribs}
            attribsPbMap={target.getAttributesMap()}
          />
        </SectionItem>
        <SetListEditor
          list={actions}
          setList={setActions}
          initialVals={target.getActionsList()}
          sectionHeader="Actions"
          freeFormAdd
          freeFormPlaceholder="New action"
          freeFormValidation={{
            value: /^[a-z0-9-_]+$/i,
            message:
              "Invalid characters (alphanum, dashes and underscores only)",
          }}
        />
        <Card.Footer>
          <Button type="submit">Save</Button>
        </Card.Footer>
      </Card.Body>
    </Card>
  );
}
