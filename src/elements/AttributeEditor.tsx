import * as jspb from "google-protobuf";
import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { PropsWithChildren, useEffect, useState } from "react";
import { Alert, Form, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import ClickableItem from "./ClickableItem";

interface Props {
  attribs: Map<string, Set<string>>;
  attribsPbMap?: jspb.Map<string, proto.common.AttributeValues>;
  setAttribs: Function;
}

export default function AttributeEditor(props: PropsWithChildren<Props>) {
  const {
    register,
    formState: { errors },
  } = useForm({ mode: "all" });

  useEffect(() => {
    if (props.attribsPbMap) {
      let new_attribs = new Map<string, Set<string>>();
      props.attribsPbMap.forEach(
        (vals: proto.common.AttributeValues, key: string) => {
          new_attribs.set(key, new Set(vals.getValuesList()));
        }
      );
      props.setAttribs(new_attribs);
    }
  }, [props.attribsPbMap]);

  const newAttrValEvent = (
    event: React.KeyboardEvent<HTMLInputElement>,
    attrkey: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      let val = event.currentTarget.value.trim();
      if (val.length > 0) {
        props.attribs.get(attrkey)?.add(val);
        props.setAttribs(new Map(props.attribs));
        event.currentTarget.value = "";
      }
    }
  };

  const newAttrKeyEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === "Enter" || event.key === " ") && !errors.newattrib) {
      event.preventDefault();
      let val = event.currentTarget.value.trim();
      if (val.length > 0) {
        props.attribs.set(val, new Set());
        props.setAttribs(new Map(props.attribs));
        event.currentTarget.value = "";
      }
    }
  };

  const removeAttrVal = (attrkey: string, val: string) => {
    console.log("remove " + attrkey + ": " + val);
    props.attribs.get(attrkey)?.delete(val);
    props.setAttribs(new Map(props.attribs));
  };

  let headers: JSX.Element[] = [];
  if (props.attribs.size > 0) {
    headers.push(
      <tr className="subheading" key="header">
        <th>Key</th>
        <th>Value(s)</th>
      </tr>
    );
  }

  let derivedAttrs: JSX.Element[] = [];
  let attrs: JSX.Element[] = [];
  if (props.attribs.size > 0) {
    props.attribs.forEach((val: Set<string>, key: string) => {
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
    <Table className="showEntryTable">
      <thead>{headers}</thead>
      <tbody>{attrs}</tbody>
    </Table>
  );
}
