import React, { useEffect, useState } from "react";
import { Col, Container, Nav, NavLink, Row } from "react-bootstrap";
import { useOutletContext, useParams } from "react-router";
import { Link, Outlet } from "react-router-dom";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

type ContextType = {
  entities: Map<string, Map<string, proto.entities.Entity>>;
};

export default function EntitiesPage() {
  let nullMap = new Map<string, Map<string, proto.entities.Entity>>();
  const [entities, setEntities] = useState(nullMap);

  // load data from API on first render
  useEffect(() => {
    let request = new proto.entities.GetAllEntitiesRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );
    let ent_map = new Map<string, Map<string, proto.entities.Entity>>();
    let result = gatehouseSvc
      .getEntities(request, null)
      .then((response) => {
        let entities = response.getEntitiesList();
        entities.forEach((entity: proto.entities.Entity) => {
          let typestr = entity.getTypestr();
          if (!ent_map.has(typestr)) {
            ent_map.set(typestr, new Map<string, proto.entities.Entity>());
          }
          let typed_entities = ent_map.get(typestr);
          if (typed_entities !== undefined) {
            typed_entities.set(entity.getName(), entity);
          }
        });
        setEntities(ent_map);
      })
      .catch((err) => {
        console.error("ERROR:");
        console.error(err);
      });
  }, []);

  /// Prints the nav for keys, organized by types
  const entityNav = () => {
    let type_sections: JSX.Element[] = [];
    const typed_entities = new Map(
      [...entities.entries()].sort(([a], [b]) => String(a).localeCompare(b))
    );
    typed_entities.forEach((vals, key) => {
      let entity_items: JSX.Element[] = [];
      [...vals.keys()].sort().forEach((val) => {
        let uid = key + "/" + val;
        entity_items.push(
          <Link key={uid} className="item" to={uid}>
            <li key={uid}>{val}</li>
          </Link>
        );
      });

      type_sections.push(
        <Container className="header" key={key + "_header"}>
          {key}
        </Container>
      );

      let item = (
        <Container className="itemList" key={key + "_list"}>
          <ul>{entity_items}</ul>
        </Container>
      );
      type_sections.push(item);
    });
    return <Container>{type_sections}</Container>;
  };

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav h-100 p-0">
        {entityNav()}
      </Col>
      <Col className="mainContent">
        <Outlet context={{ entities }} />
      </Col>
    </Row>
  );
}

export function useEntities() {
  return useOutletContext<ContextType>();
}
