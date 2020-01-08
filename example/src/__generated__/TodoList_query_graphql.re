/* @generated */

module Unions = {};

module Types = {
  type node = {
    id: string,
    __wrappedFragment__SingleTodo_todoItem: ReasonRelay.wrappedFragmentRef,
  };
  type edges = {node: option(node)};
  type todosConnection = {edges: option(array(option(edges)))};
};

open Types;

type fragment = {todosConnection};

module FragmentConverters: {
  let unwrapFragment_node:
    node =>
    {. "__$fragment_ref__SingleTodo_todoItem": SingleTodo_todoItem_graphql.t};
} = {
  external unwrapFragment_node:
    node =>
    {. "__$fragment_ref__SingleTodo_todoItem": SingleTodo_todoItem_graphql.t} =
    "%identity";
};

module Internal = {
  type fragmentRaw;
  let fragmentConverter: Js.Dict.t(array((int, string))) = [%raw
    {| {"todosConnection_edges":[[0,""],[1,""]],"todosConnection_edges_node":[[0,""]]} |}
  ];
  let fragmentConverterMap = ();
  let convertFragment = v =>
    v
    ->ReasonRelay._convertObj(
        fragmentConverter,
        fragmentConverterMap,
        Js.undefined,
      );
};

type t;
type fragmentRef;
type fragmentRefSelector('a) =
  {.. "__$fragment_ref__TodoList_query": t} as 'a;
external getFragmentRef: fragmentRefSelector('a) => fragmentRef = "%identity";

type operationType = ReasonRelay.fragmentNode;

let node: operationType = [%bs.raw
  {| {
  "kind": "Fragment",
  "name": "TodoList_query",
  "type": "Query",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": "after",
        "direction": "forward",
        "path": [
          "todosConnection"
        ]
      }
    ]
  },
  "argumentDefinitions": [
    {
      "kind": "LocalArgument",
      "name": "first",
      "type": "Int!",
      "defaultValue": 10
    },
    {
      "kind": "LocalArgument",
      "name": "after",
      "type": "String!",
      "defaultValue": ""
    }
  ],
  "selections": [
    {
      "kind": "LinkedField",
      "alias": "todosConnection",
      "name": "__TodoList_query_todosConnection_connection",
      "storageKey": null,
      "args": null,
      "concreteType": "TodoItemConnection",
      "plural": false,
      "selections": [
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "edges",
          "storageKey": null,
          "args": null,
          "concreteType": "TodoItemEdge",
          "plural": true,
          "selections": [
            {
              "kind": "LinkedField",
              "alias": null,
              "name": "node",
              "storageKey": null,
              "args": null,
              "concreteType": "TodoItem",
              "plural": false,
              "selections": [
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "id",
                  "args": null,
                  "storageKey": null
                },
                {
                  "kind": "ScalarField",
                  "alias": null,
                  "name": "__typename",
                  "args": null,
                  "storageKey": null
                },
                {
                  "kind": "FragmentSpread",
                  "name": "SingleTodo_todoItem",
                  "args": null
                }
              ]
            },
            {
              "kind": "ScalarField",
              "alias": null,
              "name": "cursor",
              "args": null,
              "storageKey": null
            }
          ]
        },
        {
          "kind": "LinkedField",
          "alias": null,
          "name": "pageInfo",
          "storageKey": null,
          "args": null,
          "concreteType": "PageInfo",
          "plural": false,
          "selections": [
            {
              "kind": "ScalarField",
              "alias": null,
              "name": "endCursor",
              "args": null,
              "storageKey": null
            },
            {
              "kind": "ScalarField",
              "alias": null,
              "name": "hasNextPage",
              "args": null,
              "storageKey": null
            }
          ]
        },
        {
          "kind": "ClientExtension",
          "selections": [
            {
              "kind": "ScalarField",
              "alias": null,
              "name": "__$generated__connection__key__$$__TodoList_query_todosConnection$$$name__$$__todosConnection",
              "args": null,
              "storageKey": null
            }
          ]
        }
      ]
    }
  ]
} |}
];
