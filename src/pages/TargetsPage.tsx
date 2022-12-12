import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Alert, CloseButton, Col, Container, Row } from "react-bootstrap";
import { Outlet, useNavigate, useOutletContext } from "react-router";
import { Link } from "react-router-dom";
import Expando from "../elements/Expando";
import ExpandoItem from "../elements/ExpandoItem";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

type ContextType = {
  targets: Map<string, Map<string, proto.targets.Target>>;
};

export default function TargetsPage() {
  const navigate = useNavigate();
  const [targets, setTargets]: [
    Map<string, Map<string, proto.targets.Target>>,
    any
  ] = useState(new Map());

  const [loading, setLoading]: [boolean, Function] = useState(true);
  const [errorMsg, setErrorMsg]: [string | null, any] = useState(null);
  const [statusMsg, setStatusMsg]: [string | null, any] = useState(null);

  useEffect(() => {
    let request = new proto.targets.GetTargetsRequest();
    let gatehouseSvc = new GatehousePromiseClient(
      "http://localhost:6174",
      null,
      null
    );
    let tgt_map = new Map<string, Map<string, proto.targets.Target>>();
    gatehouseSvc
      .getTargets(request, null)
      .then((response) => {
        let targets = response.getTargetsList();
        targets.forEach((target: proto.targets.Target) => {
          let typestr = target.getTypestr();
          if (!tgt_map.has(typestr)) {
            tgt_map.set(typestr, new Map<string, proto.targets.Target>());
          }
          let typed_actors = tgt_map.get(typestr);
          if (typed_actors !== undefined) {
            typed_actors.set(target.getName(), target);
          }
          setTargets(tgt_map);
        });
      })
      .catch((err) => {
        setErrorMsg(err.message);
      });
  }, []);

  const targetNav = () => {
    let type_sections: JSX.Element[] = [];
    type_sections.push(
      <Container className="header" key={"add_header"}>
        <span>Targets</span>
        <span style={{ float: "right" }}>
          <Link key="addbutton" to="add">
            <FontAwesomeIcon
              icon={faSquarePlus}
              className="plusButton"
              inverse
            />
          </Link>
        </span>
      </Container>
    );

    const typed_targets = new Map(
      [...targets.entries()].sort(([a], [b]) => String(a).localeCompare(b))
    );
    typed_targets.forEach((vals, key) => {
      let target_items: JSX.Element[] = [];
      [...vals.keys()].sort().forEach((val) => {
        let uid = key + "/" + val;
        target_items.push(
          <ExpandoItem
            className="item"
            key={uid}
            onClick={() => navigate("view/" + uid)}
          >
            {val}
          </ExpandoItem>
        );
      });

      let item = (
        <Expando variant="sidenav" key={key + "_expando"} title={key} expand>
          {target_items}
        </Expando>
      );
      type_sections.push(item);
    });
    return <>{type_sections}</>;
  };

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav p-0">
        <Container>{targetNav()}</Container>
      </Col>
      <Col className="mainContent">
        <Alert variant="danger" show={errorMsg !== null}>
          {errorMsg}
          <CloseButton
            style={{ float: "right" }}
            onClick={() => setErrorMsg(null)}
          />
        </Alert>
        <Alert variant="success" show={statusMsg !== null}>
          {statusMsg}
          <CloseButton
            style={{ float: "right" }}
            onClick={() => setStatusMsg(null)}
          />
        </Alert>
        <Outlet context={{ targets }} />
      </Col>
    </Row>
  );
}

export function useTargets() {
  return useOutletContext<ContextType>();
}
