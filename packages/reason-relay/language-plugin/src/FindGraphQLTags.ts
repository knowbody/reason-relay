import { GraphQLTag } from "relay-compiler/lib/language/RelayLanguagePluginInterface";

const invariant = require("invariant");

function parseFile(text: string, file: string) {
  if (!text.includes("[%relay.")) {
    return [];
  }

  invariant(
    text.indexOf("[%relay.") >= 0,
    "RelayFileIRParser: Files should be filtered before passed to the " +
      "parser, got unfiltered file `%s`.",
    file
  );

  /**
   * This should eventually be done in a native Reason program and not through a (horrible)
   * regexp, but this will do just to get things working.
   */

  const matched = text.match(
    /(?<=\[%relay\.(query|fragment|mutation|subscription))([\s\S]*?)(?=];)/g
  );

  if (matched) {
    // Removes {||} used in multiline Reason strings
    return matched.map(text => ({
      template: text.replace(/({\||\|})/g, ""),
      keyName: null,
      sourceLocationOffset: { line: 1, column: 1 }
    }));
  }

  return [];
}

export function find(text: string, filePath: string): Array<GraphQLTag> {
  return parseFile(text, filePath);
}
