// jest-dom's DOM matchers (toBeInTheDocument, toHaveTextContent, ...) registered
// against Vitest's expect. The /vitest entry point is what wires them up; the
// bare '@testing-library/jest-dom' import only works under Jest.
import '@testing-library/jest-dom/vitest';
