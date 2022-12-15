import { useEffect, useState } from "react";

export default function useSetDiff(orig: string[], working: Set<string>) {
  const [added, setAdded]: [string[], any] = useState([]);
  const [removed, setRemoved]: [string[], any] = useState([]);

  useEffect(() => {
    if (!orig || !working) {
      return;
    }

    let temp_added: string[] = [];
    let temp_removed: string[] = [];

    // if existing actions aren't in working set, add to remove_actions
    orig.forEach((action) => {
      if (!working.has(action)) {
        temp_removed.push(action);
      }
    });

    // if working set actions aren't in existing set, add to add_actions
    working.forEach((action) => {
      if (!orig.includes(action)) {
        temp_added.push(action);
      }
    });

    setAdded(temp_added);
    setRemoved(temp_removed);
  }, [orig, working]);

  return {
    added,
    removed,
  };
}
