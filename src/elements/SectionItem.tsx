import { PropsWithChildren } from "react";

interface Props {
  className?: string;
}

export default function SectionItem(props: PropsWithChildren<Props>) {
  let classNames = ["section-item"];
  if (props.className) classNames.push(props.className);

  return <span className={classNames.join(" ")}>{props.children}</span>;
}
