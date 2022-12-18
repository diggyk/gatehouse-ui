import { FormEvent, useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { useForm, ValidationRule } from "react-hook-form";
import { useNavigate } from "react-router";
import Expando from "../elements/Expando";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import SetListEditor from "../elements/SetListEditor";
import { StringCheckEditor } from "../elements/StringCheckEditor";
import useStringCheck from "../hooks/useStringCheck";
import { usePageContext } from "./PolicyRulesPage";

export default function AddPolicyRule() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "all" });
  const onError = (errors: any) => {};
  const { client, rules, setErrorMsg, setStatusMsg, setRules } =
    usePageContext();

  const [addActorCheck, setAddActorCheck]: [boolean, Function] =
    useState(false);
  const actorNameMatch = useStringCheck();
  const actorTypeMatch = useStringCheck();

  const [anyEnv, setAnyEnv]: [boolean, Function] = useState(true);
  const [anyTarget, setAnyTarget]: [boolean, Function] = useState(true);
  const [rulePasses, setRulePasses]: [boolean, Function] = useState(true);

  const nameValidation = {
    value: /^[a-z0-9-_@.]+$/i,
    message: "Invalid characters (alphanum, dashes, underscores, and @ only)",
  };
  const typeValidation = nameValidation;

  const handleAdd = (data: any) => {};

  // ACTOR MATCHING SECTION
  const actorMatching = () => {
    return (
      <>
        <SectionItem>
          <b>
            <Form.Switch
              label={
                addActorCheck ? "Match actor based on..." : "Match any actor"
              }
              checked={addActorCheck}
              onChange={(_) => setAddActorCheck(!addActorCheck)}
            />
          </b>
        </SectionItem>
        {addActorCheck && (
          <>
            <StringCheckEditor
              checkName={"Name"}
              checkObject={actorNameMatch}
              validation={nameValidation}
            />
            <StringCheckEditor
              checkName={"Type"}
              checkObject={actorTypeMatch}
              validation={nameValidation}
            />
          </>
        )}
      </>
    );
  };

  return (
    <Form onSubmit={handleSubmit(handleAdd, onError)}>
      <Card className="showEntryCard wide">
        <Card.Body>
          <Card.Title>
            <Form.Control
              className="name"
              id="name"
              placeholder="Role name"
              {...register("name", {
                required: true,
                pattern: {
                  value: /^[a-z0-9-_@]+$/i,
                  message:
                    "Invalid characters (alphanum, dashes, underscores, and at-sign only)",
                },
              })}
            />
            {errors && errors.name && errors.name.message && (
              <p className="formError">{errors.name.message.toString()}</p>
            )}
          </Card.Title>
          <Card.Subtitle>
            <Form.Control
              as="textarea"
              className="desc"
              id="desc"
              placeholder="Optional description"
              {...register("desc", {
                required: false,
              })}
            />
          </Card.Subtitle>
          <SectionItem>
            <Expando title="Actor matching" expand variant="cardsections">
              {actorMatching()}
            </Expando>
            <Expando title="Environment matching" variant="cardsections">
              <SectionHeader>When environment matches...</SectionHeader>
              <SectionItem>
                <Form.Switch
                  label="Any Environment"
                  checked={anyEnv}
                  onChange={(_) => setAnyEnv(!anyEnv)}
                ></Form.Switch>
              </SectionItem>
            </Expando>
            <Expando title="Target matching" variant="cardsections">
              <SectionHeader>When target matches...</SectionHeader>
              <SectionItem>
                <Form.Switch
                  label="Any Target"
                  checked={anyTarget}
                  onChange={(_) => setAnyTarget(!anyTarget)}
                ></Form.Switch>
              </SectionItem>
            </Expando>
            <SectionHeader>... then decide</SectionHeader>
            <SectionItem>
              <Form.Switch
                label={rulePasses ? "ALLOW" : "DENY"}
                checked={rulePasses}
                onChange={(_) => setRulePasses(!rulePasses)}
              ></Form.Switch>
            </SectionItem>
          </SectionItem>
          <Card.Footer>
            <Button type="submit">Create</Button>
          </Card.Footer>
        </Card.Body>
      </Card>
    </Form>
  );
}
