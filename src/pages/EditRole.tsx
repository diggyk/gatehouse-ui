import { useEffect, useState } from "react";
import { Button, Card, Container, Form, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import SetListEditor from "../elements/SetListEditor";
import useGroups from "../hooks/useGroups";
import useSetDiff from "../hooks/useSetDiff";
import { usePageContext } from "./RolesPage";

export default function EditRole() {
  const navigate = useNavigate();
  const { name } = useParams();
  const { client, setErrorMsg, setStatusMsg, roles, setRoles } =
    usePageContext();
  const { register, handleSubmit } = useForm({ mode: "all" });
  const onError = (errors: any) => {};

  const { groupsAbbr } = useGroups(client);
  const [currentGrants, setCurrentGrants]: [string[], any] = useState([]);
  const [grants, setGrants]: [Set<string>, Function] = useState(new Set());
  const { added: grantsAdded, removed: grantsRemoved } = useSetDiff(
    currentGrants,
    grants
  );

  useEffect(() => {
    if (name) {
      let list = roles.get(name)?.getGrantedToList();
      setCurrentGrants(list);
    }
  }, [name]);

  // update the role
  const handleUpdate = (data: any) => {
    let req = new proto.roles.ModifyRoleRequest()
      .setAddGrantedToList(grantsAdded)
      .setRemoveGrantedToList(grantsRemoved)
      .setDesc(data.desc)
      .setName(name || "");

    client
      .modifyRole(req, null)
      .then((response: proto.roles.RoleResponse) => {
        let updated_role = response.getRole();

        if (!updated_role) {
          setErrorMsg("No update role returned from server");
          return;
        }

        setStatusMsg("Role " + updated_role.getName() + " updated!");
        setRoles(roles.set(updated_role.getName(), updated_role));
        navigate("/roles/view/" + updated_role.getName());
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
      });
  };

  if (!name) {
    return <Container>Error -- name not set</Container>;
  }

  const role = roles.get(name);

  if (!role) {
    return (
      <Card>
        <Card.Body>ERROR: Role not found in context</Card.Body>
      </Card>
    );
  }

  return (
    <Form onSubmit={handleSubmit(handleUpdate, onError)}>
      <Card className="showEntryCard">
        <Card.Body>
          <Card.Title>{role.getName()}</Card.Title>
          <Card.Subtitle>
            <Form.Control
              className="desc"
              id="desc"
              defaultValue={role.getDesc()}
              as="textarea"
              placeholder="Optional description"
              {...register("desc", {
                required: false,
              })}
            />
          </Card.Subtitle>
          <SetListEditor
            list={grants}
            setList={setGrants}
            initialVals={role.getGrantedToList()}
            sectionHeader="Granted to"
            optionsList={groupsAbbr}
          />
          <Card.Footer>
            <Button type="submit">Save</Button>
          </Card.Footer>
        </Card.Body>
      </Card>
    </Form>
  );
}
