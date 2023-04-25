/// <reference types="svelte-gestures" />

type Views = "list" | "timeline";

declare namespace Filter {
  type Criteria = "date" | "project" | "title" | "utilized" | "tags" | "duration";
  type StringPredicate = "starts_with" | "ends_with" | "contains" | "equals";
  type Predicate = StringPredicate;
  type Combinator = "and" | "or";
  type Set = {
    value?: string;
    criteria?: Filter.Criteria;
    predicate?: Filter.Predicate;
  }[];
}

declare namespace svelte.JSX {
  interface HTMLAttributes<T> {
    onhold: () => void;
    onrelease: () => void;
  }
}
