import * as jspb from "google-protobuf";
import { Button, Card, Container, Form, Table } from "react-bootstrap";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { usePageContext } from "./ActorsPage";
import { useEffect, useState } from "react";
import ClickableItem from "../elements/ClickableItem";
import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import AttributeEditor from "../elements/AttributeEditor";

export default function EditActor() {
  const navigate = useNavigate();
  const { typestr, name } = useParams();
  const { client, actors, setActors, setErrorMsg, setStatusMsg } =
    usePageContext();
  const {
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "all" });

  const [attribs, setAttribs]: [Map<string, Set<string>>, any] = useState(
    new Map()
  );

  const attribsToMessage = (
    attrs: Map<string, proto.common.AttributeValues>
  ): string => {
    let msg: string = "";
    attrs.forEach((vals, key) => {
      msg += key + ": " + vals.getValuesList().join(", ") + "\n";
    });

    return msg;
  };

  const handleUpdate = (data: any) => {
    let current_attribs: jspb.Map<string, proto.common.AttributeValues> =
      actor!.getAttributesMap();
    let add_attributes = new Map<string, proto.common.AttributeValues>();
    let remove_attributes = new Map<string, proto.common.AttributeValues>();

    // find all attributes not in the entity so we can add them
    attribs.forEach((vals, key) => {
      if (!current_attribs.has(key)) {
        add_attributes.set(
          key,
          new proto.common.AttributeValues().setValuesList([...vals])
        );
      } else {
        let current_vals = new Set(current_attribs.get(key)!.getValuesList());
        let additional_vals: string[] = [];
        vals.forEach((val) => {
          if (!current_vals.has(val)) {
            additional_vals.push(val);
          }
        });

        if (additional_vals.length > 0) {
          add_attributes.set(
            key,
            new proto.common.AttributeValues().setValuesList(additional_vals)
          );
        }
      }
    });

    // find all attributes not in the working list so we can remove them
    current_attribs.forEach((vals, key) => {
      if (!attribs.has(key)) {
        remove_attributes.set(key, vals);
      } else {
        let working_vals = attribs.get(key)!;
        let remove_vals: string[] = [];
        [...vals.getValuesList()].forEach((val) => {
          if (!working_vals.has(val)) {
            remove_vals.push(val);
          }
        });

        if (remove_vals.length > 0) {
          remove_attributes.set(
            key,
            new proto.common.AttributeValues().setValuesList(remove_vals)
          );
        }
      }
    });

    if (add_attributes.size > 0) {
      console.log("add:");
      console.log(attribsToMessage(add_attributes));
    }
    if (remove_attributes.size > 0) {
      console.log("remove:");
      console.log(attribsToMessage(remove_attributes));
    }
    let req = new proto.actors.ModifyActorRequest()
      .setName(name!)
      .setTypestr(typestr!);

    add_attributes.forEach((val, key) => {
      req.getAddAttributesMap(false).set(key, val);
    });
    remove_attributes.forEach((val, key) => {
      req.getRemoveAttributesMap(false).set(key, val);
    });

    client
      .modifyActor(req, null)
      .then((response) => {
        let updated_actor = response.getActor();

        if (!updated_actor) {
          setErrorMsg("No updated actor returned from server");
          return;
        }

        setStatusMsg(
          "Actor " +
            updated_actor.getTypestr() +
            ":" +
            updated_actor.getName() +
            " updated!"
        );

        let typed_actors = actors.get(typestr!);
        if (!typed_actors) {
          typed_actors = new Map();
        }
        typed_actors.set(name!, updated_actor);

        setActors(new Map(actors));
        navigate("/actors/view/" + typestr + "/" + name);
      })
      .catch((error: Error) => {
        setErrorMsg(error.message);
      });
  };

  if (!typestr || !name) {
    return <Container>Error -- type or name not set</Container>;
  }

  const actor = actors.get(typestr)?.get(name);

  if (!actor) {
    return (
      <Card>
        <Card.Body>ERROR: Actor not found in context</Card.Body>
      </Card>
    );
  }

  return (
    <Form onSubmit={handleSubmit(handleUpdate)}>
      <Card className="showEntryCard">
        <Card.Body>
          <Card.Title>{actor.getName()}</Card.Title>
          <Card.Subtitle>{actor.getTypestr()}</Card.Subtitle>
          <SectionHeader>Attributes</SectionHeader>
          <SectionItem>
            <AttributeEditor
              attribs={attribs}
              setAttribs={setAttribs}
              attribsPbMap={actor.getAttributesMap()}
            />
          </SectionItem>
          <Card.Footer>
            <Button type="submit">Save</Button>
          </Card.Footer>
        </Card.Body>
      </Card>
    </Form>
  );
}
