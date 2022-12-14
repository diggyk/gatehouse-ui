import { useState } from "react";
import { Button, Card, Container, Form, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import AttributeEditor from "../elements/AttributeEditor";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import SetListEditor from "../elements/SetListEditor";
import { usePageContext } from "./TargetsPage";

import AttributeValues = proto.common.AttributeValues;

export default function AddActor() {
  const navigate = useNavigate();
  const { typestr, name } = useParams();
  const { client, targets, setTargets, setErrorMsg, setStatusMsg } =
    usePageContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "all" });
  const onError = (errors: any) => {};

  const [attribs, setAttribs]: [Map<string, Set<string>>, any] = useState(
    new Map()
  );
  const [actions, setActions]: [Set<string>, Function] = useState(new Set());

  const handleUpdate = (data: any) => {
    let req = new proto.targets.AddTargetRequest()
      .setName(data.name)
      .setTypestr(data.typestr)
      .setActionsList([...actions]);

    attribs.forEach((vals, key) => {
      req
        .getAttributesMap(false)
        .set(key, new AttributeValues().setValuesList([...vals]));
    });

    client
      .addTarget(req, null)
      .then((response: proto.targets.TargetResponse) => {
        let updated_target = response.getTarget();

        if (!updated_target) {
          setErrorMsg("No added target returned from server");
          return;
        }

        setStatusMsg(
          "Target " +
            updated_target.getTypestr() +
            ":" +
            updated_target.getName() +
            " added!"
        );

        let typed_targets = targets.get(data.typestr);
        if (!typed_targets) {
          typed_targets = new Map();
        }
        typed_targets.set(data.name, updated_target);
        targets.set(data.typestr, typed_targets);

        setTargets(new Map(targets));
        navigate("/targets/view/" + data.typestr + "/" + data.name);
      })
      .catch((error: Error) => {
        setErrorMsg(error.message);
      });
  };

  return (
    <Form onSubmit={handleSubmit(handleUpdate, onError)}>
      <Card className="showEntryCard">
        <Card.Body>
          <Card.Title>
            <Form.Control
              className="name"
              id="name"
              placeholder="Target name"
              {...register("name", {
                required: true,
                pattern: {
                  value: /^[a-z0-9-_@]+$/i,
                  message:
                    "Invalid characters (alphanum, dashes, underscores, and at-sign only)",
                },
              })}
            />
            {errors && errors.name && errors.name.message && (
              <p className="formError">{errors.name.message.toString()}</p>
            )}
          </Card.Title>
          <Card.Subtitle>
            <Form.Control
              className="desc"
              id="typestr"
              placeholder="Target type"
              {...register("typestr", {
                required: true,
                pattern: {
                  value: /^[a-z0-9-_]+$/i,
                  message:
                    "Invalid characters (alphanum, dashes, and underscores only)",
                },
              })}
            />
            {errors && errors.typestr && errors.typestr.message && (
              <p className="formError">{errors.typestr.message.toString()}</p>
            )}
          </Card.Subtitle>
          <SectionHeader>Attributes</SectionHeader>
          <SectionItem>
            <AttributeEditor attribs={attribs} setAttribs={setAttribs} />
          </SectionItem>
          <SetListEditor
            list={actions}
            setList={setActions}
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
