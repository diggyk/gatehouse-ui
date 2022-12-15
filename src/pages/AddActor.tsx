import { Button, Card, Container, Form, Table } from "react-bootstrap";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePageContext } from "./ActorsPage";
import { useEffect, useState } from "react";
import ClickableItem from "../elements/ClickableItem";
import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";

export default function AddActor() {
  const navigate = useNavigate();
  const { client, actors, setActors, setErrorMsg, setStatusMsg } =
    usePageContext();
  const {
    register,
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
    let add_attributes = new Map<string, proto.common.AttributeValues>();

    // find all attributes not in the entity so we can add them
    attribs.forEach((vals, key) => {
      add_attributes.set(
        key,
        new proto.common.AttributeValues().setValuesList([...vals])
      );
    });

    let req = new proto.actors.AddActorRequest()
      .setName(data.name)
      .setTypestr(data.typestr);

    add_attributes.forEach((val, key) => {
      req.getAttributesMap(false).set(key, val);
    });

    client
      .addActor(req, null)
      .then((response) => {
        let added_actor = response.getActor();

        if (!added_actor) {
          setErrorMsg("No updated actor returned from server");
          return;
        }

        setStatusMsg(
          "Actor " +
            added_actor.getTypestr() +
            ":" +
            added_actor.getName() +
            " added!"
        );

        let typed_actors = actors.get(data.typestr);
        if (!typed_actors) {
          typed_actors = new Map();
        }
        typed_actors.set(data.name, added_actor);
        actors.set(data.typestr, typed_actors);

        setActors(new Map(actors));
        navigate("/actors/view/" + data.typestr + "/" + data.name);
      })
      .catch((error: Error) => {
        setErrorMsg(error.message);
      });
  };

  const newAttrValEvent = (
    event: React.KeyboardEvent<HTMLInputElement>,
    attrkey: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      let val = event.currentTarget.value.trim();
      if (val.length > 0) {
        attribs.get(attrkey)?.add(val);
        setAttribs(new Map(attribs));
        event.currentTarget.value = "";
      }
    }
  };

  const newAttrKeyEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === "Enter" || event.key === " ") && !errors.newattrib) {
      event.preventDefault();
      let val = event.currentTarget.value.trim();
      if (val.length > 0) {
        attribs.set(val, new Set());
        setAttribs(new Map(attribs));
        event.currentTarget.value = "";
      }
    }
  };

  const removeAttrVal = (attrkey: string, val: string) => {
    attribs.get(attrkey)?.delete(val);
    setAttribs(new Map(attribs));
  };

  let headers: JSX.Element[] = [];
  if (attribs.size > 0) {
    headers.push(
      <tr className="subheading" key="header">
        <th>Key</th>
        <th>Value(s)</th>
      </tr>
    );
  }

  let derivedAttrs: JSX.Element[] = [];
  let attrs: JSX.Element[] = [];
  if (attribs.size > 0) {
    attribs.forEach((val: Set<string>, key: string) => {
      if (key === "has-role" || key === "member-of") {
        derivedAttrs.push(
          <tr key={key} className="skinny-footnote">
            <td>{key} *</td>
            <td>{[...val.values()].sort().join(", ")}</td>
          </tr>
        );
      } else {
        attrs.push(
          <tr key={key}>
            <td>{key}</td>
            <td
              style={{
                display: "block",
                maxWidth: "400px",
                overflow: "auto",
              }}
            >
              {[...val.values()].sort().map((val) => {
                return (
                  <ClickableItem
                    key={"remove_" + key + "_" + val}
                    onClick={() => {
                      removeAttrVal(key, val);
                    }}
                    leftIcon={faSquareXmark}
                  >
                    {val}
                  </ClickableItem>
                );
              })}
              <Form.Control
                className="inline-input"
                placeholder="New value"
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  newAttrValEvent(event, key);
                }}
              />
            </td>
          </tr>
        );
      }
    });
    if (derivedAttrs.length > 0) {
      derivedAttrs.push(
        <tr key={"derived_legend"}>
          <td colSpan={2} className="skinny-footnote">
            * based on group membership
          </td>
        </tr>
      );
      attrs.splice(0, 0, ...derivedAttrs);
    }
  } else {
    attrs.push(
      <tr key="emptyattributes">
        <td colSpan={2}>No attributes</td>
      </tr>
    );
  }

  attrs.push(
    <tr key="new_attrib">
      <td colSpan={2}>
        <Form.Control
          className="inline-input"
          placeholder="New attribute"
          {...register("newattrib", {
            required: false,
            pattern: {
              value: /^[a-z0-9-_]+$/i,
              message:
                "Invalid characters (alphanum, dashes and underscores only)",
            },
          })}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            newAttrKeyEvent(event);
          }}
        />
        {errors && errors.newattrib && errors.newattrib.message && (
          <p className="formError">{errors.newattrib.message.toString()}</p>
        )}
      </td>
    </tr>
  );

  return (
    <Form onSubmit={handleSubmit(handleUpdate)}>
      <Card className="showEntryCard">
        <Card.Body>
          <Card.Title>
            <Form.Control
              className="name"
              id="name"
              placeholder="Actor name"
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
              placeholder="Actor type"
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
            <Table className="showEntryTable">
              <thead>{headers}</thead>
              <tbody>{attrs}</tbody>
            </Table>
          </SectionItem>
          <Card.Footer>
            <Button type="submit">Save</Button>
          </Card.Footer>
        </Card.Body>
      </Card>
    </Form>
  );
}
