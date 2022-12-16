import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ChangeEvent, useEffect, useState } from "react";
import { Button, Card, Form, Table } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../elements/SectionHeader";
import SectionItem from "../elements/SectionItem";
import SetListEditor from "../elements/SetListEditor";
import useGroups from "../hooks/useGroups";
import { usePageContext } from "./RolesPage";

export default function Role() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "all" });
  const onError = (errors: any) => {};
  const { client, setErrorMsg, setStatusMsg, roles, setRoles } =
    usePageContext();

  const { groupsAbbr } = useGroups(client, { setErrorMsg });
  const [addGranted, setAddGranted]: [Set<string>, any] = useState(new Set());

  // update the role
  const handleAdd = (data: any) => {
    let req = new proto.roles.AddRoleRequest()
      .setGrantedToList([...addGranted])
      .setDesc(data.desc)
      .setName(data.name);

    client
      .addRole(req, null)
      .then((response: proto.roles.RoleResponse) => {
        let added_role = response.getRole();

        if (!added_role) {
          setErrorMsg("No update role returned from server");
          return;
        }

        setStatusMsg("Role " + added_role.getName() + " added!");

        setRoles(roles.set(added_role.getName(), added_role));

        navigate("/roles/view/" + added_role.getName());
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
      });
  };

  return (
    <Form onSubmit={handleSubmit(handleAdd, onError)}>
      <Card className="showEntryCard">
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
          <SectionHeader>Grant to</SectionHeader>
          <SetListEditor
            list={addGranted}
            setList={setAddGranted}
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
