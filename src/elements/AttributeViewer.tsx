import * as jspb from "google-protobuf";
import { PropsWithChildren } from "react";
import { Table } from "react-bootstrap";

interface Props {
  attribs: jspb.Map<string, proto.common.AttributeValues>;
}

export default function AttributeViewer(
  props: PropsWithChildren<Props>
): JSX.Element {
  let headers: JSX.Element[] = [];
  if (props.attribs.getLength() > 0) {
    headers.push(
      <tr className="subheading" key="header">
        <th>Key</th>
        <th>Value(s)</th>
      </tr>
    );
  }

  let derivedAttrs: JSX.Element[] = [];
  let attrs: JSX.Element[] = [];
  if (props.attribs.getLength() > 0) {
    props.attribs.forEach((val: proto.common.AttributeValues, key: string) => {
      if (key === "has-role" || key === "member-of") {
        derivedAttrs.push(
          <tr key={key}>
            <td>{key} *</td>
            <td>{val.getValuesList().sort().join(", ")}</td>
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
              {val.getValuesList().sort().join(", ")}
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

  return (
    <Table className="showEntryTable">
      <thead>{headers}</thead>
      <tbody>{attrs}</tbody>
    </Table>
  );
}
