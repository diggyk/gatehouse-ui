import { PropsWithChildren } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { ValidationRule } from "react-hook-form";
import { StringCheck } from "../hooks/useStringCheck";
import SectionItem from "./SectionItem";
import SetListEditor from "./SetListEditor";

interface Props {
  checkName: string;
  checkObject: StringCheck;
  validation: ValidationRule<RegExp>;
}

export const StringCheckEditor = (
  props: PropsWithChildren<Props>
): JSX.Element => {
  const isNameCheckValid = () => {
    return !(
      props.checkObject.matchType != -1 && props.checkObject.matchList.size == 0
    );
  };
  return (
    <div className={isNameCheckValid() ? "section" : "section invalid"}>
      <SectionItem className="stringcheckeditor">
        <span style={{ float: "left" }}>
          {props.checkName} is
          <Form.Select
            value={props.checkObject.matchType}
            onChange={(e) =>
              props.checkObject.setMatchType(e.currentTarget.value)
            }
          >
            <option value={-1}>ANYTHING</option>
            <option value={0}>ONE OF</option>
            <option value={1}>NOT ONE OF</option>
          </Form.Select>
        </span>
        {props.checkObject.matchType != -1 && (
          <SetListEditor
            floatingItems
            list={props.checkObject.matchList}
            setList={props.checkObject.setMatchList}
            hideEmptyMessage
            freeFormAdd
            freeFormPlaceholder={props.checkName}
            freeFormValidation={props.validation}
          />
        )}
      </SectionItem>
    </div>
  );
};
