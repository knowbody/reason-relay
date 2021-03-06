/**
 * This is bound to each nested object with fragments,
 * and used as a dummy function for casting a record
 * to a Js.t object with the fragment references.
 */
function getFragmentRefs() {
  return this;
}

function getNewObj(maybeNewObj, currentObj) {
  return maybeNewObj || Object.assign({}, currentObj);
}

function getPathName(path) {
  return path.join("_");
}

function makeNewPath(currentPath, newKeys) {
  return [].concat(currentPath, newKeys);
}

/**
 * Runs on each object in the tree and follows the provided instructions
 * to apply transforms etc.
 */
function traverse(
  currentPath,
  currentObj,
  instructionMap,
  converters,
  nullableValue,
  instructionPaths,
  addFragmentOnRoot
) {
  var newObj;

  if (addFragmentOnRoot) {
    newObj = getNewObj(newObj, currentObj);
    newObj.getFragmentRefs = getFragmentRefs.bind(newObj);
  }

  for (var key in currentObj) {
    var isUnion = false;
    var originalValue = currentObj[key];

    // Instructions are stored by the path in the object where they apply
    var thisPath = makeNewPath(currentPath, [key]);
    var path = getPathName(thisPath);

    var instructions = instructionMap[path];

    var hasDeeperInstructions =
      instructionPaths.filter(function(p) {
        return p.indexOf(path) === 0 && p.length > path.length;
      }).length > 0;

    if (instructions) {
      if (currentObj[key] == null) {
        if (instructions["n"] === "") {
          newObj = getNewObj(newObj, currentObj);
          newObj[key] = nullableValue;
        }
      } else {
        var shouldAddFragmentFn = instructions["f"] === "";

        var shouldConvertEnum =
          typeof instructions["e"] === "string" &&
          !!converters[instructions["e"]];

        var shouldConvertUnion =
          typeof instructions["u"] === "string" &&
          !!converters[instructions["u"]];

        /**
         * Handle arrays
         */
        if (Array.isArray(currentObj[key])) {
          newObj = getNewObj(newObj, currentObj);
          newObj[key] = currentObj[key].map(function(v) {
            if (v == null) {
              return nullableValue;
            }

            if (shouldConvertEnum) {
              return converters[instructions["e"]](v);
            }

            if (
              shouldConvertUnion &&
              typeof v === "object" &&
              typeof v.__typename === "string"
            ) {
              isUnion = true;

              var newPath = makeNewPath(currentPath, [
                key,
                v.__typename.toLowerCase()
              ]);

              var unionRootHasFragment =
                (instructionMap[getPathName(newPath)] || {}).f === "";

              var traversedValue = traverse(
                newPath,
                v,
                instructionMap,
                converters,
                nullableValue,
                instructionPaths,
                unionRootHasFragment
              );

              return converters[instructions["u"]](traversedValue);
            }

            if (shouldAddFragmentFn && typeof v === "object") {
              var objWithFragmentFn = Object.assign({}, v);
              objWithFragmentFn.getFragmentRefs = getFragmentRefs.bind(
                objWithFragmentFn
              );
              return objWithFragmentFn;
            }

            return v;
          });
        } else {
          /**
           * Handle normal values.
           */
          var v = currentObj[key];

          if (shouldConvertEnum) {
            newObj = getNewObj(newObj, currentObj);
            newObj[key] = converters[instructions["e"]](v);
          }

          if (
            shouldConvertUnion &&
            typeof v === "object" &&
            typeof v.__typename === "string"
          ) {
            isUnion = true;

            var newPath = makeNewPath(currentPath, [
              key,
              v.__typename.toLowerCase()
            ]);

            var unionRootHasFragment =
              (instructionMap[getPathName(newPath)] || {}).f === "";

            var traversedValue = traverse(
              newPath,
              v,
              instructionMap,
              converters,
              nullableValue,
              instructionPaths,
              unionRootHasFragment
            );

            newObj = getNewObj(newObj, currentObj);
            newObj[key] = converters[instructions["u"]](traversedValue);
          }

          if (shouldAddFragmentFn && typeof v === "object") {
            newObj = getNewObj(newObj, currentObj);

            var objWithFragmentFn = Object.assign({}, v);

            objWithFragmentFn.getFragmentRefs = getFragmentRefs.bind(
              objWithFragmentFn
            );

            newObj[key] = objWithFragmentFn;
          }
        }
      }
    }

    if (hasDeeperInstructions && originalValue != null && !isUnion) {
      var nextObj = (newObj && newObj[key]) || currentObj[key];

      if (typeof nextObj === "object" && !Array.isArray(originalValue)) {
        var traversedObj = traverse(
          thisPath,
          nextObj,
          instructionMap,
          converters,
          nullableValue,
          instructionPaths
        );

        if (traversedObj !== nextObj) {
          newObj = getNewObj(newObj, currentObj);
          newObj[key] = traversedObj;
        }
      } else if (Array.isArray(originalValue)) {
        newObj = getNewObj(newObj, currentObj);
        newObj[key] = nextObj.map(function(o) {
          return typeof o === "object" && o != null
            ? traverse(
                thisPath,
                o,
                instructionMap,
                converters,
                nullableValue,
                instructionPaths
              )
            : o;
        });
      }
    }
  }

  return newObj || currentObj;
}

/**
 * This function takes an object (snapshot from the Relay store) and applies a
 * set of conversions deeply on the object (instructions coming from "converters"-prop).
 * It converts nullable values either to null or undefined, and it wraps/unwraps enums
 * and unions.
 *
 * It preserves structural integrity where possible, and return new objects where properties
 * have been modified.
 */
function traverser(root, _instructionMap, converters, nullableValue) {
  if (!root) {
    return nullableValue;
  }

  var instructionMap = _instructionMap || {};
  var instructionPaths = Object.keys(instructionMap);

  // Nothing to convert, bail early
  if (instructionPaths.length === 0) {
    return root;
  }

  // We'll add a getFragmentRefs function to the root if needed here.
  // getFragmentRefs is currently the only thing that's possible to add
  // to the root.
  var fragmentsOnRoot = (instructionMap[""] || {}).f === "";

  if (Array.isArray(root)) {
    return root.map(function(v) {
      if (v == null) {
        return nullableValue;
      }

      return v == null
        ? nullableValue
        : traverse(
            [],
            v,
            instructionMap,
            converters,
            nullableValue,
            instructionPaths,
            fragmentsOnRoot
          );
    });
  }

  var newObj = Object.assign({}, root);

  var v = traverse(
    [],
    newObj,
    instructionMap,
    converters,
    nullableValue,
    instructionPaths,
    fragmentsOnRoot
  );

  return v;
}

module.exports = { traverser };
