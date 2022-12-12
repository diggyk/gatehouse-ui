import { Button, Card, Container, Form, Table } from "react-bootstrap";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePageContext } from "./ActorsPage";
import { useEffect, useState } from "react";
import ClickableItem from "../elements/ClickableItem";
import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";

export default function Actor() {
  const navigate = useNavigate();
  const { typestr, name } = useParams();
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

  useEffect(() => {
    if (!typestr || !name) return;
    let new_attribs = new Map<string, Set<string>>();
    actors
      .get(typestr)
      ?.get(name)
      ?.getAttributesMap()
      .forEach((vals: proto.common.AttributeValues, key: string) => {
        new_attribs.set(key, new Set(vals.getValuesList()));
      });
    setAttribs(new_attribs);
  }, [typestr, name]);

  const handleUpdate = (data: any) => {
    let current_attribs: Map<string, proto.common.AttributeValues> =
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
    console.log("remove " + attrkey + ": " + val);
    attribs.get(attrkey)?.delete(val);
    setAttribs(new Map(attribs));
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
          <Card.Title>{actor.getName()}</Card.Title>
          <Card.Subtitle>{actor.getTypestr()}</Card.Subtitle>
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
