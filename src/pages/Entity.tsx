import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Fade,
  ListGroup,
  ListGroupItem,
  Nav,
  NavLink,
  Row,
  Table,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";
import { useEntities } from "./EntitiesPage";

export default function Entity() {
  const { entities } = useEntities();
  const { typestr, name } = useParams();

  if (!typestr || !name) {
    return <Container>Error -- type or name not set</Container>;
  }

  const entity = entities.get(typestr)?.get(name);

  if (!entity) {
    return (
      <Card>
        <Card.Body>ERROR: Entity not found in context</Card.Body>
      </Card>
    );
  }

  let attributes = entity.getAttributesMap();
  let attrs: JSX.Element[] = [];
  if (attributes.getLength() > 0) {
    attributes.forEach((val: proto.common.AttributeValues, key: string) => {
      attrs.push(
        <tr key={key}>
          <td>{key}</td>
          <td>{val.getValuesList().join(", ")}</td>
        </tr>
      );
    });
  } else {
    attrs.push(
      <tr key="emptyattributes">
        <td colSpan={2}>No attributes</td>
      </tr>
    );
  }

  return (
    <Card className="showEntryCard">
      <Card.Body>
        <Card.Title>{entity.getName()}</Card.Title>
        <Card.Subtitle>{entity.getTypestr()}</Card.Subtitle>
        <Table className="showEntryTable">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Value(s)</th>
            </tr>
          </thead>
          <tbody>{attrs}</tbody>
        </Table>
        <Button disabled>Edit</Button>
      </Card.Body>
    </Card>
  );
}
