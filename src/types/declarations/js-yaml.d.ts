declare module 'js-yaml' {
  /**
   * Loads YAML from a string or file
   */
  export function load(
    input: string,
    options?: LoadOptions
  ): any;

  /**
   * Loads YAML from a string or file, returning an array of documents
   */
  export function loadAll(
    input: string,
    iterator: (document: any) => void,
    options?: LoadOptions
  ): void;

  /**
   * Dumps a JavaScript object as a YAML string
   */
  export function dump(
    obj: any,
    options?: DumpOptions
  ): string;

  /**
   * Options for loading YAML
   */
  export interface LoadOptions {
    /** Function to call on warning messages */
    onWarning?: (warning: Error) => void;
    /** Specifies if the parser should throw on duplicate keys */
    schema?: any;
    /** Compatibility with JSON.parse behavior */
    json?: boolean;
    /** Enable/disable bestPath transformations */
    legacy?: boolean;
    /** Allows a custom handling of non-fulfilled references */
    listener?: ((state: any) => void) | null;
    /** Specifies a schema preset to use */
    filename?: string;
  }

  /**
   * Options for dumping YAML
   */
  export interface DumpOptions {
    /** Indentation width to use (in spaces) */
    indent?: number;
    /** Specifies line width */
    lineWidth?: number;
    /** If true, will not add an ending newline character */
    noRefs?: boolean;
    /** When true, sort keys alphabetically */
    sortKeys?: boolean;
    /** Set max line width */
    noCompatMode?: boolean;
    /** Forces quotes for non-key strings */
    flowLevel?: number;
    /** Stylize output with one of these canonical forms */
    styles?: { [style: string]: string };
    /** Include schema directive in output */
    skipInvalid?: boolean;
    /** If true, adds YAML directive in output */
    schema?: any;
    /** Function to call on warning messages */
    noArrayIndent?: boolean;
    /** If true, don't escape non-ASCII characters */
    condenseFlow?: boolean;
    /** Set max line width for quoted strings */
    quotingType?: string;
    /** Force quotes for strings. Default is true */
    forceQuotes?: boolean;
  }
}
