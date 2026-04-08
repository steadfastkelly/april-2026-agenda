// ── Shared People Directory ────────────────────────────────────────
// Single source of truth for team member names and departments.
// Avatars are rendered as colored initials — no image pipeline needed.

export type Department = "LEAD" | "DES" | "AM" | "DEV";

export interface Person {
  id: string;
  name: string;
  department: Department;
}

export const people: Record<string, Person> = {
  taylor:   { id: "taylor",   name: "Taylor",   department: "LEAD" },
  tori:     { id: "tori",     name: "Tori",     department: "LEAD" },
  jake:     { id: "jake",     name: "Jake",     department: "LEAD" },
  rebecca:  { id: "rebecca",  name: "Rebecca",  department: "AM" },
  brittney: { id: "brittney", name: "Brittney", department: "AM" },
  ben:      { id: "ben",      name: "Ben",      department: "DEV" },
  kayla:    { id: "kayla",    name: "Kayla",     department: "DES" },
  jen:      { id: "jen",      name: "Jen",       department: "DES" },
  rachel:   { id: "rachel",   name: "Rachel",   department: "DES" },
  carson:   { id: "carson",   name: "Carson",   department: "DES" },
  miranda:  { id: "miranda",  name: "Miranda",  department: "DES" },
  jack:     { id: "jack",     name: "Jack",     department: "DES" },
  joy:      { id: "joy",      name: "Joy",       department: "DES" },
  kelly:    { id: "kelly",    name: "Kelly",     department: "LEAD" },
};

/** Ordered list for the header row (Full Team default order) */
export const peopleList: Person[] = [
  people.taylor, people.tori, people.jake, people.kelly,
  people.kayla, people.joy, people.jen, people.rachel,
  people.miranda, people.carson, people.jack, people.ben,
  people.brittney, people.rebecca,
];

/** Department-specific ordered member lists (team leads first) */
export const DEPARTMENT_MEMBERS: Record<Department, string[]> = {
  LEAD: ["taylor", "tori", "jake", "kelly"],
  DES:  ["kelly", "kayla", "joy", "jen", "rachel", "miranda", "carson", "jack"],
  AM:   ["jake", "brittney", "rebecca"],
  DEV:  ["jake", "ben"],
};

/** Get ordered people list for a given filter state.
 *  When a department is active, its members come first (in specified order),
 *  followed by the remaining people in the default Full Team order. */
export function getOrderedPeopleList(activeDept: Department | null): Person[] {
  if (!activeDept) return peopleList;
  const deptIds = DEPARTMENT_MEMBERS[activeDept];
  const deptPeople = deptIds.map((id) => people[id]).filter(Boolean);
  const rest = peopleList.filter((p) => !deptIds.includes(p.id));
  return [...deptPeople, ...rest];
}

/** Department display names */
export const DEPARTMENT_LABELS: Record<Department, string> = {
  LEAD: "Leadership",
  DES: "Design",
  AM: "Account Mgmt",
  DEV: "Development",
};

/** Department badge colors */
export const DEPARTMENT_COLORS: Record<Department, string> = {
  LEAD: "#b08d6e",
  DES: "#8f784e",
  AM: "#c2ab74",
  DEV: "#6b8aad",
};