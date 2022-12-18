import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Alert, CloseButton, Col, Container, Row } from "react-bootstrap";
import { Outlet, useOutletContext } from "react-router";
import { Link } from "react-router-dom";
import { useAppContext } from "../App";
import { GatehousePromiseClient } from "../protos/gatehouse_grpc_web_pb";

type ContextType = {
  client: GatehousePromiseClient;
  setErrorMsg: Function;
  setStatusMsg: Function;
  rules: Map<string, proto.policies.PolicyRule>;
  setRules: Function;
};

export default function PolicyRulesPage() {
  const { client } = useAppContext();
  const [rules, setRules] = useState(
    new Map<string, proto.policies.PolicyRule>()
  );
  const [loading, setLoading]: [boolean, Function] = useState(true);
  const [errorMsg, setErrorMsg]: [string | null, any] = useState(null);
  const [statusMsg, setStatusMsg]: [string | null, any] = useState(null);

  useEffect(() => {
    let request = new proto.policies.GetPoliciesRequest();
    client
      .getPolicies(request, null)
      .then((response) => {
        let rules_map = new Map<string, proto.policies.PolicyRule>();
        response.getRulesList().forEach((rule: proto.policies.PolicyRule) => {
          rules_map.set(rule.getName(), rule);
        });
        setRules(rules_map);
        setLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message);
      });
  }, []);

  const rulesNav = () => {
    let rules_list: JSX.Element[] = [];

    [...rules.values()]
      .sort((a, b) => String(a.getName()).localeCompare(b.getName()))
      .forEach((rule) => {
        let name = rule.getName();
        rules_list.push(
          <Link key={name} className="item" to={name}>
            <li key={name}>{name}</li>
          </Link>
        );
      });
    return (
      <Container>
        <Container className="header" key={"header"}>
          <span>Policy Rules</span>
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
        <Container className="itemList" key={"rules_list"}>
          <ul>{rules_list}</ul>
        </Container>
      </Container>
    );
  };

  return (
    <Row className="h-100">
      <Col lg="2" className="sidePickerNav p-0">
        {rulesNav()}
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
            context={{ client, rules, setErrorMsg, setStatusMsg, setRules }}
          />
        )}
      </Col>
    </Row>
  );
}

export function usePageContext() {
  return useOutletContext<ContextType>();
}
