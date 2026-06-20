export const CONCEPTS = [
  "What is an interface, really? What is an API underneath the word?",
  "What goes on behind the scenes when you open the ChatGPT app?",
  "What is a frontend, and what is a backend, and why do we need both?",
  "Why do we need a backend at all?",
  "What are the different ways to store data, and why do we need a database from first principles?",
  "How do you choose one storage option over another, and which factors decide it?",
] as const;

export type Concept = (typeof CONCEPTS)[number];
