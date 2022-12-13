import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { listenerCount } from "process";
import { PropsWithChildren, useEffect } from "react";
import { Form } from "react-bootstrap";
import { useForm, ValidationRule } from "react-hook-form";
import SectionHeader from "./SectionHeader";
import SectionItem from "./SectionItem";

interface Props {
  list: Set<string>;
  setList: Function;
  initialVals?: string[];
  freeFormAdd?: boolean;
  freeFormPlaceholder?: string;
  freeFormValidation?: ValidationRule<RegExp>;
  sectionHeader?: string;
}

export default function SetListEditor(props: PropsWithChildren<Props>) {
  const {
    register,
    formState: { errors },
  } = useForm({ mode: "all" });

  useEffect(() => {
    if (props.initialVals) {
      let new_set = new Set();
      props.initialVals.forEach((v) => {
        new_set.add(v);
      });
      props.setList(new_set);
    }
  }, [props.initialVals]);

  const removeFromList = (item: string) => {
    props.list.delete(item);
    props.setList(new Set(props.list));
  };

  const newListItem = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if ((event.key === "Enter" || event.key === " ") && !errors.newitem) {
      event.preventDefault();
      let val = event.currentTarget.value.trim();
      if (val.length > 0) {
        props.list.add(val);
        props.setList(new Set(props.list));
        event.currentTarget.value = "";
      }
    }
  };

  let elements: JSX.Element[] = [];

  if (props.list.size > 0)
    [...props.list].sort().forEach((listitem) => {
      elements.push(
        <SectionItem key={"item_" + listitem}>
          <FontAwesomeIcon
            icon={faSquareXmark}
            className="delete-icon-btn"
            inverse
            onClick={() => removeFromList(listitem)}
          />
          {listitem}
        </SectionItem>
      );
    });
  else {
    elements.push(<SectionItem key="noattrib">No attributes</SectionItem>);
  }

  if (props.freeFormAdd) {
    let freeFormValidation = props.freeFormValidation
      ? props.freeFormValidation
      : {
          value: /^.*$/i,
          message: "",
        };
    elements.push(
      <SectionItem key={"add_new"}>
        <Form.Control
          className="inline-input"
          placeholder={props.freeFormPlaceholder}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            newListItem(event);
          }}
          {...register("newitem", {
            required: false,
            pattern: freeFormValidation,
          })}
        />
        {errors && errors.newitem && errors.newitem.message && (
          <p className="formError">{errors.newitem.message.toString()}</p>
        )}
      </SectionItem>
    );
  }

  return (
    <>
      {props.sectionHeader && (
        <SectionHeader>{props.sectionHeader}</SectionHeader>
      )}
      {elements}
    </>
  );
}
