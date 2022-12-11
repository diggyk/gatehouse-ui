import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PropsWithChildren, useState } from "react";

interface Props {
  expand?: boolean;
  title: string;
  className?: string;
  variant?: string;
}

export default function Expando(props: PropsWithChildren<Props>) {
  const [expand, setExpand] = useState(props.expand || false);
  const [title, _] = useState(props.title || "");

  const toggleExpand = () => {
    setExpand(!expand);
  };

  const chevron = expand ? faChevronDown : faChevronUp;

  let headerClasses = ["expando-header"];
  if (expand) headerClasses.push("expanded");

  let mainClasses = ["expando"];
  switch (props.variant) {
    case "sidenav":
      mainClasses.push("sidenav");
      break;
    default:
      mainClasses.push("default");
  }

  if (props.className) mainClasses.push(props.className);

  return (
    <div className={mainClasses.join(" ")}>
      <span className={headerClasses.join(" ")} onClick={toggleExpand}>
        {title}
        <FontAwesomeIcon icon={chevron} />
      </span>
      {expand && <span className="expando-body">{props.children}</span>}
    </div>
  );
}
