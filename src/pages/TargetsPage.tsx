import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Outlet, useOutletContext } from "react-router";
import { Link } from "react-router-dom";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

type ContextType = {
  targets: Map<string, Map<string, proto.targets.Target>>;
};

export default function TargetsPage() {
  let nullMap = new Map<string, Map<string, proto.targets.Target>>();
  const [targets, setTargets] = useState(nullMap);
  const [error, setError] = useState(null);

  useEffect(() => {
    let request = new proto.targets.GetAllTargetsRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );
    let tgt_map = new Map<string, Map<string, proto.targets.Target>>();
    let result = gatehouseSvc
      .getTargets(request, null)
      .then((response) => {
        let targets = response.getTargetsList();
        targets.forEach((target: proto.targets.Target) => {
          let typestr = target.getTypestr();
          if (!tgt_map.has(typestr)) {
            tgt_map.set(typestr, new Map<string, proto.targets.Target>());
          }
          let typed_entities = tgt_map.get(typestr);
          if (typed_entities !== undefined) {
            typed_entities.set(target.getName(), target);
          }
          setTargets(tgt_map);
        });
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  const targetNav = () => {
    let type_sections: JSX.Element[] = [];
    const typed_targets = new Map(
      [...targets.entries()].sort(([a], [b]) => String(a).localeCompare(b))
    );
    typed_targets.forEach((vals, key) => {
      let target_items: JSX.Element[] = [];
      [...vals.keys()].sort().forEach((val) => {
        let uid = key + "/" + val;
        target_items.push(
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
          <ul>{target_items}</ul>
        </Container>
      );
      type_sections.push(item);
    });
    return <Container>{type_sections}</Container>;
  };

  let mainContent;
  if (error == null) {
    mainContent = <Outlet context={{ targets }} />;
  } else {
    mainContent = <Container className="errorNote">{error}</Container>;
  }

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav h-100 p-0">
        {targetNav()}
      </Col>
      <Col className="mainContent">{mainContent}</Col>
    </Row>
  );
}

export function useTargets() {
  return useOutletContext<ContextType>();
}
