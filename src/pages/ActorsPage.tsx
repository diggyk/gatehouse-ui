import { useEffect, useState } from "react";
import { Alert, CloseButton, Col, Container, Row } from "react-bootstrap";
import { useOutletContext } from "react-router";
import { Link, Outlet } from "react-router-dom";
import { useAppContext } from "../App";
import useActors from "../hooks/useActors";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

type ContextType = {
  client: GatehousePromiseClient;
  setErrorMsg: Function;
  setStatusMsg: Function;
  actors: Map<string, Map<string, proto.actors.Actor>>;
  setActors: Function;
};

export default function ActorsPage() {
  const { client } = useAppContext();
  const [loading, setLoading]: [boolean, Function] = useState(true);
  const [errorMsg, setErrorMsg]: [string | null, any] = useState(null);
  const [statusMsg, setStatusMsg]: [string | null, any] = useState(null);

  const { actors, setActors } = useActors(client, { setErrorMsg, setLoading });

  /// Prints the nav for keys, organized by types
  const entityNav = () => {
    let type_sections: JSX.Element[] = [];
    const typed_actors = new Map(
      [...actors.entries()].sort(([a], [b]) => String(a).localeCompare(b))
    );
    typed_actors.forEach((vals, key) => {
      let entity_items: JSX.Element[] = [];
      [...vals.keys()].sort().forEach((val) => {
        let uid = key + "/" + val;
        entity_items.push(
          <Link key={uid} className="item" to={"view/" + uid}>
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
      <Col lg="2" className="sidePickerNav p-0">
        {entityNav()}
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
        {!loading && (
          <Outlet
            context={{ client, setErrorMsg, setStatusMsg, actors, setActors }}
          />
        )}
      </Col>
    </Row>
  );
}

export function usePageContext() {
  return useOutletContext<ContextType>();
}
