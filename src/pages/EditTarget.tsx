import { useState } from "react";
import { Button, Card, Container, Form, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import AttributeEditor from "../elements/AttributeEditor";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import SetListEditor from "../elements/SetListEditor";
import useSetDiff from "../hooks/useSetDiff";
import { usePageContext } from "./TargetsPage";

import AttributeValues = proto.common.AttributeValues;

export default function EditActor() {
  const navigate = useNavigate();
  const { typestr, name } = useParams();
  const { client, targets, setTargets, setErrorMsg, setStatusMsg } =
    usePageContext();
  const {
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "all" });
  const onError = (errors: any) => {};

  const [attribs, setAttribs]: [Map<string, Set<string>>, any] = useState(
    new Map()
  );
  const [actions, setActions]: [Set<string>, Function] = useState(new Set());
  const { added: actionsAdded, removed: actionsRemoved } = useSetDiff(
    targets
      .get(typestr || "")
      ?.get(name || "")
      ?.getActionsList() || [],
    actions
  );

  const attribsToMessage = (attrs: Map<string, AttributeValues>): string => {
    let msg: string = "";
    attrs.forEach((vals, key) => {
      msg += key + ": " + vals.getValuesList().join(", ") + "\n";
    });

    return msg;
  };

  // take a look at our existing target, and the desired list of actions
  // and attributes and come up with the add/remove actions/attribs values
  // to use in the update request
  const assessChanges = () => {
    let add_attributes: Map<string, AttributeValues> = new Map();
    let remove_attributes: Map<string, AttributeValues> = new Map();

    const existing_attribs = target?.getAttributesMap();

    // if existing attribs aren't in working set, add to remove_attributes
    existing_attribs?.forEach((vals: AttributeValues, key: string) => {
      if (!attribs.has(key)) {
        remove_attributes.set(key, vals);
      } else {
        let remove_vals = new AttributeValues();
        vals.getValuesList().forEach((val: string) => {
          if (!attribs.get(key)?.has(val)) {
            remove_vals.addValues(val);
          }
        });
        if (remove_vals.getValuesList().length > 0) {
          remove_attributes.set(key, remove_vals);
        }
      }
    });

    // if working set of attributes aren't in existing attributes, add to add_attributes
    attribs.forEach((vals, key) => {
      if (!existing_attribs?.has(key)) {
        add_attributes.set(key, new AttributeValues().setValuesList([...vals]));
      } else {
        let add_vals = new AttributeValues();
        vals.forEach((val) => {
          if (!existing_attribs.get(key)?.getValuesList().includes(val)) {
            add_vals.addValues(val);
          }
        });
        if (add_vals.getValuesList().length > 0) {
          add_attributes.set(key, add_vals);
        }
      }
    });

    return {
      add_attributes,
      remove_attributes,
    };
  };

  const handleUpdate = (data: any) => {
    let { add_attributes, remove_attributes } = assessChanges();
    let req = new proto.targets.ModifyTargetRequest()
      .setName(name!)
      .setTypestr(typestr!)
      .setAddActionsList(actionsAdded)
      .setRemoveActionsList(actionsRemoved);

    add_attributes.forEach((val, key) => {
      req.getAddAttributesMap(false).set(key, val);
    });
    remove_attributes.forEach((val, key) => {
      req.getRemoveAttributesMap(false).set(key, val);
    });

    client
      .modifyTarget(req, null)
      .then((response: proto.targets.TargetResponse) => {
        let updated_target = response.getTarget();

        if (!updated_target) {
          setErrorMsg("No updated target returned from server");
          return;
        }

        setStatusMsg(
          "Target " +
            updated_target.getTypestr() +
            ":" +
            updated_target.getName() +
            " updated!"
        );

        let typed_targets = targets.get(typestr!);
        if (!typed_targets) {
          typed_targets = new Map();
        }
        typed_targets.set(name!, updated_target);

        setTargets(new Map(targets));
        navigate("/targets/view/" + typestr + "/" + name);
      })
      .catch((error: Error) => {
        setErrorMsg(error.message);
      });
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
    <Form onSubmit={handleSubmit(handleUpdate, onError)}>
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
    </Form>
  );
}
