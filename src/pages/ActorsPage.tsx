import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Alert, CloseButton, Col, Container, Row } from "react-bootstrap";
import { useNavigate, useOutletContext } from "react-router";
import { Link, Outlet } from "react-router-dom";
import { useAppContext } from "../App";
import Expando from "../elements/Expando";
import ExpandoItem from "../elements/ExpandoItem";
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
  const navigate = useNavigate();
  const { client } = useAppContext();
  const [loading, setLoading]: [boolean, Function] = useState(true);
  const [errorMsg, setErrorMsg]: [string | null, any] = useState(null);
  const [statusMsg, setStatusMsg]: [string | null, any] = useState(null);

  const { actors, setActors } = useActors(client, { setErrorMsg, setLoading });

  /// Prints the nav for keys, organized by types
  const actorNav = () => {
    let type_sections: JSX.Element[] = [];
    type_sections.push(
      <Container className="header" key={"add_header"}>
        <span>Actors</span>
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

    const typed_actors = new Map(
      [...actors.entries()].sort(([a], [b]) => String(a).localeCompare(b))
    );
    typed_actors.forEach((vals, key) => {
      let actor_items: JSX.Element[] = [];
      [...vals.keys()].sort().forEach((val) => {
        let uid = key + "/" + val;
        actor_items.push(
          <ExpandoItem
            className="item"
            key={uid}
            onClick={() => navigate("view/" + uid)}
          >
            {val}
          </ExpandoItem>
        );
      });

      type_sections.push(
        <Expando variant="sidenav" key={key + "_expando"} title={key} expand>
          {actor_items}
        </Expando>
      );
    });
    return <>{type_sections}</>;
  };

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav p-0">
        <Container>{actorNav()}</Container>
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
