import { MouseEventHandler, PropsWithChildren } from "react";

interface Props {
  leftButton?: boolean;
  onClick?: MouseEventHandler<HTMLSpanElement>;
}

export default function ExpandoItem(props: PropsWithChildren<Props>) {
  let classnames = ["expando-item"];
  props.leftButton
    ? classnames.push("left-button")
    : classnames.push("right-button");
  if (props.onClick) classnames.push("clickable");

  const onClick = props.onClick ? props.onClick : () => {};

  return (
    <span className={classnames.join(" ")} onClick={onClick}>
      {props.children}
    </span>
  );
}
