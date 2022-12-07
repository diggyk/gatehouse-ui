import { PropsWithChildren } from "react";

export default function SectionItem(props: PropsWithChildren) {
  return <span className="section-item">{props.children}</span>;
}
